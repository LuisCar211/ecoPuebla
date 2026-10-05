import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, query, where, setDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import ts from 'typescript';

const folder = fileURLToPath(new URL('.', import.meta.url));
const temp = await mkdtemp(`${folder}.flow-`);
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
await writeFile(`${temp}/nearest.mjs`, compile(await readFile(new URL('../src/services/nearest.ts', import.meta.url), 'utf8')));
await writeFile(`${temp}/fixture.mjs`, `export const auth = { currentUser: null }; export let db; export function selectActor(uid, firestore) { auth.currentUser = { uid }; db = firestore; }`);
let source = compile(await readFile(new URL('../src/services/assignment.ts', import.meta.url), 'utf8'));
source = source.replace(/from ['"]\.\/firebase['"]/g, "from './fixture.mjs'").replace(/from ['"]\.\/nearest['"]/g, "from './nearest.mjs'");
await writeFile(`${temp}/assignment.mjs`, source);
let pickupSource = compile(await readFile(new URL('../src/services/pickup.ts', import.meta.url), 'utf8'));
pickupSource = pickupSource.replace(/from ['"]\.\/firebase['"]/g, "from './fixture.mjs'");
await writeFile(`${temp}/pickup.mjs`, pickupSource);
const { confirmPickup } = await import(pathToFileURL(`${temp}/pickup.mjs`));
const service = await import(pathToFileURL(`${temp}/assignment.mjs`));
const { selectActor } = await import(pathToFileURL(`${temp}/fixture.mjs`));
const env = await initializeTestEnvironment({ projectId: 'demo-ecopuebla-test', firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') } });
const dbFor = uid => env.authenticatedContext(uid, { email: `${uid}@test.invalid` }).firestore();
const company = dbFor('empresa'), a = dbFor('a'), b = dbFor('b');
const point = longitude => ({ latitude: 19, longitude });
const data = { uid: 'empresa', author: 'Empresa', materialId: 'pet-transparente', material: 'PET transparente',
  categoriaId: 'plasticos', codigoResina: '1', precioMinKg: 2.5, precioMaxKg: 4, condicionPrecio: 'Paca limpia',
  quantity: 12, address: 'Puebla', content: '', ubicacion: point(-98), descartados: [] };
async function seed(path, value) {
  await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), path), value));
}
async function location(db, uid, longitude, disponible = true) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'usuarios', uid), { ubicacion: point(longitude), disponible });
  batch.set(doc(db, 'recicladores', uid), { ubicacion: point(longitude), disponible, updatedAt: serverTimestamp() });
  await batch.commit();
}

try {
  await test('real app assignment service and Firestore rules', async t => {
    await env.clearFirestore();
    for (const [uid, rol] of [['empresa', 'Empresa'], ['a', 'Reciclador'], ['b', 'Reciclador']]) {
      await seed(`usuarios/${uid}`, { id: uid, nombre: uid, correo: `${uid}@test.invalid`, rol, acreditado: false });
    }
    await seed('materiales/pet-transparente', { nombre: 'PET transparente', activo: true, publicable: true });

    await t.test('registration can create its own profile but cannot add privileged fields', async () => {
      const newUser = dbFor('nuevo');
      await assertSucceeds(setDoc(doc(newUser, 'usuarios', 'nuevo'), {
        id: 'nuevo', nombre: 'Nuevo', correo: 'nuevo@test.invalid', acreditado: false, rol: 'Reciclador',
      }));
      await assertFails(setDoc(doc(newUser, 'usuarios', 'otra-cuenta'), {
        id: 'otra-cuenta', nombre: 'Otro', correo: 'nuevo@test.invalid', acreditado: false, rol: 'Empresa',
      }));
      await assertFails(updateDoc(doc(newUser, 'usuarios', 'nuevo'), { acreditado: true }));
    });

    await t.test('location/profile batch creates minimal directory; private profiles and unauthenticated access stay blocked', async () => {
      await assertSucceeds(location(a, 'a', -98.01));
      await assertSucceeds(location(b, 'b', -98.2));
      const docs = await assertSucceeds(getDocs(collection(company, 'recicladores')));
      assert.equal(docs.size, 2);
      assert.deepEqual(Object.keys(docs.docs[0].data()).sort(), ['disponible', 'ubicacion', 'updatedAt']);
      await assertFails(getDoc(doc(company, 'usuarios', 'a')));
      await assertFails(getDocs(collection(company, 'usuarios')));
      await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), 'recicladores')));
      await assertFails(updateDoc(doc(a, 'recicladores', 'b'), { disponible: false }));
      await assertFails(updateDoc(doc(a, 'recicladores', 'a'), { correo: 'private@test.invalid', updatedAt: serverTimestamp() }));
    });

    let postId;
    await t.test('publish assigns closest recycler; visibility follows participants', async () => {
      selectActor('empresa', company);
      postId = await service.publishAssignedPost(data);
      const saved = (await getDoc(doc(company, 'posts', postId))).data();
      assert.equal(saved.estado, 'ofrecido'); assert.equal(saved.ofrecidoA, 'a');
      assert.deepEqual(saved.participantes, ['empresa', 'a']); assert.equal(saved.precioMinKg, 2.5);
      assert.equal((await getDocs(query(collection(a, 'posts'), where('participantes', 'array-contains', 'a')))).size, 1);
      await assertFails(getDoc(doc(b, 'posts', postId)));
      await assertFails(updateDoc(doc(a, 'posts', postId), { quantity: 999 }));
    });

    await t.test('reject atomically assigns next recycler and removes old visibility', async () => {
      selectActor('a', a); await service.answerOffer(postId, false);
      const saved = (await getDoc(doc(company, 'posts', postId))).data();
      assert.equal(saved.estado, 'ofrecido'); assert.equal(saved.ofrecidoA, 'b');
      assert.deepEqual(saved.descartados, ['a']); assert.deepEqual(saved.participantes, ['empresa', 'b']);
      await assertFails(getDoc(doc(a, 'posts', postId)));
      await assertSucceeds(getDoc(doc(b, 'posts', postId)));
    });

    await t.test('concurrent accept attempts have only one winner and prevent retrying a reservation', async () => {
      selectActor('b', b);
      const results = await Promise.allSettled([service.answerOffer(postId, true), service.answerOffer(postId, true)]);
      assert.equal(results.filter(item => item.status === 'fulfilled').length, 1);
      const saved = (await getDoc(doc(company, 'posts', postId))).data();
      assert.equal(saved.estado, 'apartado'); assert.equal(saved.apartadoPara, 'b');
      selectActor('empresa', company); await assert.rejects(service.retryAssignment(postId), /ofrecida o apartada/);
      await assertFails(updateDoc(doc(company, 'posts', postId), { estado: 'sin_candidatos' }));
    });

    await t.test('only the owner company can confirm pickup; immutable data and timestamps are protected', async () => {
      selectActor('b', b); await assert.rejects(confirmPickup(postId), /Solo la empresa/);
      await assertFails(updateDoc(doc(b, 'posts', postId), { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: 'b' }));
      await seed('usuarios/otra-empresa', { rol: 'Empresa' });
      const other = dbFor('otra-empresa');
      await assertFails(updateDoc(doc(other, 'posts', postId), { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: 'otra-empresa' }));
      await assertFails(updateDoc(doc(company, 'posts', postId), { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: 'b' }));
      await assertFails(updateDoc(doc(company, 'posts', postId), { estado: 'recolectado', recolectadoEn: new Date(0), recolectadoPor: 'empresa' }));
      await assertFails(updateDoc(doc(company, 'posts', postId), { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: 'empresa', quantity: 999 }));
      selectActor('empresa', company);
      const before = (await getDoc(doc(company, 'posts', postId))).data();
      await confirmPickup(postId);
      const saved = (await getDoc(doc(company, 'posts', postId))).data();
      assert.equal(saved.estado, 'recolectado');assert.equal(saved.recolectadoPor, 'empresa');assert.ok(saved.recolectadoEn.toMillis() > 0);
      assert.deepEqual(saved.participantes, before.participantes);assert.equal(saved.apartadoPara, 'b');assert.equal(saved.quantity, 12);
      assert.equal((await getDoc(doc(b, 'posts', postId))).data().estado, 'recolectado');
      const timestamp = saved.recolectadoEn.toMillis();
      await confirmPickup(postId);
      assert.equal((await getDoc(doc(company, 'posts', postId))).data().recolectadoEn.toMillis(), timestamp);
      await assertFails(updateDoc(doc(company, 'posts', postId), { estado: 'apartado' }));
      selectActor('b', b);await assert.rejects(service.answerOffer(postId, true), /no está disponible/);
    });

    await t.test('no candidates creates a recoverable post; retry also repairs legacy buscando', async () => {
      await location(a, 'a', -98.01, false); await location(b, 'b', -98.2, false);
      selectActor('empresa', company); const emptyId = await service.publishAssignedPost(data);
      assert.equal((await getDoc(doc(company, 'posts', emptyId))).data().estado, 'sin_candidatos');
      await assert.rejects(confirmPickup(emptyId), /debe estar apartado/);
      await assertFails(updateDoc(doc(company, 'posts', emptyId), { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: 'empresa' }));
      await location(a, 'a', -98.01);
      selectActor('empresa', company); await service.retryAssignment(emptyId);
      assert.equal((await getDoc(doc(company, 'posts', emptyId))).data().ofrecidoA, 'a');
      await seed('posts/legacy', { ...data, estado: 'buscando', ofrecidoA: null, participantes: ['empresa'] });
      await service.retryAssignment('legacy');
      assert.equal((await getDoc(doc(company, 'posts', 'legacy'))).data().estado, 'ofrecido');
    });

    await t.test('rejecting the only candidate exhausts offers; prior rejection survives retry', async () => {
      selectActor('a', a); await service.answerOffer('legacy', false);
      const saved = (await getDoc(doc(company, 'posts', 'legacy'))).data();
      assert.equal(saved.estado, 'sin_candidatos'); assert.equal(saved.ofrecidoA, null);
      assert.deepEqual(saved.participantes, ['empresa']);
      selectActor('empresa', company); await service.retryAssignment('legacy');
      assert.equal((await getDoc(doc(company, 'posts', 'legacy'))).data().estado, 'sin_candidatos');
    });

    await t.test('invalid assignment and unauthorized writes are rejected', async () => {
      const invalid = { ...data, createdAt: serverTimestamp(), ofrecidoEn: serverTimestamp(), estado: 'ofrecido',
        ofrecidoA: 'b', participantes: ['empresa', 'b'], distanciaKm: 1 };
      await assertFails(setDoc(doc(company, 'posts', 'unavailable'), invalid));
      await assertFails(setDoc(doc(a, 'posts', 'not-company'), { ...invalid, uid: 'a', ofrecidoA: 'a', participantes: ['a', 'a'] }));
      await assertFails(updateDoc(doc(a, 'usuarios', 'a'), { rol: 'Empresa' }));
      await assertFails(setDoc(doc(a, 'materiales', 'fake'), { activo: true, publicable: true }));
      selectActor('empresa', company);
      await assert.rejects(service.publishAssignedPost({ ...data, ubicacion: { latitude: 95, longitude: 0 } }), /coordenadas/);
    });
  });
} finally {
  await env.cleanup(); await rm(temp, { recursive: true, force: true });
}
