import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';
import ts from 'typescript';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const folder = fileURLToPath(new URL('.', import.meta.url));
const temp = await mkdtemp(`${folder}.ui-`);
const native = `${temp}/native.mjs`, fixture = `${temp}/fixture.mjs`;
await writeFile(native, `export const StyleSheet = { create: value => value }; export const Modal='Modal', ScrollView='ScrollView', Text='Text', TouchableOpacity='Button', View='View', ActivityIndicator='ActivityIndicator', TextInput='TextInput';`);
await writeFile(fixture, `
export const store={uid:'reciclador',rol:'Reciclador',posts:[],materials:[],requests:[],failure:null,wait:null,pickups:[]};
export function useSession(){return {user:{uid:store.uid}};}
export function useProfile(){return {profile:{rol:store.rol},loading:false};}
export function usePosts(){return {posts:store.posts,loading:false,error:''};}
export function useMaterials(){return {materials:store.materials,loading:false,error:''};}
export function useRouter(){return {push:()=>{}};}
export const Bell='Bell',Plus='Plus',CheckCircle='CheckCircle',Clock='Clock',UserX='UserX';
export const Redirect='Redirect', MapPin='MapPin', Recycle='Recycle', Search='Search';
export function errorMessage(error){return error.message;}
export async function answerOffer(id,accept){store.requests.push([id,accept]);if(store.wait)await store.wait;if(store.failure)throw store.failure;}
export async function confirmPickup(id){store.pickups.push(id);if(store.wait)await store.wait;if(store.failure)throw store.failure;}
export async function retryAssignment(){}
export async function publishAssignedPost(){}
export const auth={currentUser:{uid:'empresa'}},db={};
export function doc(){}
export async function getDoc(){throw new Error('Unexpected Firestore call in form selection test');}
export async function currentCoordinates(){return {latitude:19,longitude:-98};}
export function isCoordinates(){return true;}
export default function Placeholder(){return null;}
`);
const mapping = {
  'react-native-maps':`${temp}/maps.mjs`,
  '../services/pickup':fixture,'../services/pickup-state':`${temp}/pickup-state.mjs`,
  './coordinate-input':`${temp}/coordinates.mjs`,
  './PickupConfirmation':`${temp}/pickup-ui.mjs`, './BrandHeader':fixture,
  'react-native': native, 'firebase/firestore':fixture,
  '../services/materials':fixture, '../services/firebase':fixture, '../services/location':fixture,
  '../services/coordinate-input':`${temp}/coordinates.mjs`,
  '../services/material-categories':`${temp}/categories.mjs`, 'lucide-react-native': fixture, 'expo-router': fixture,
  '../constants/brand': `${temp}/brand.mjs`, '../../constants/brand': `${temp}/brand.mjs`,
  '../services/assignment': fixture, '../../services/assignment': fixture,
  '../services/errors': fixture, '../../services/errors': fixture,
  '../services/catalog-model': `${temp}/catalog.mjs`, '../../services/catalog-model': `${temp}/catalog.mjs`,
  '../services/material-symbol': `${temp}/symbol.mjs`,
  '../../services/posts': fixture, '../../services/profile': fixture, '../../services/session': fixture, '../../services/materials': fixture,
  './MaterialCard': `${temp}/card.mjs`, '../../components/MaterialCard': `${temp}/card.mjs`,
  '../../components/MaterialDetailsModal': `${temp}/modal.mjs`,
  '../../components/BrandHeader': fixture, '../../components/CompanyHome': fixture, '../../components/MaterialsMap': fixture,
};
await writeFile(`${temp}/maps.mjs`, `export default 'MapView';export const Callout='Callout',Marker='Marker';`);
for(const [source, target] of [
  ['src/components/CompanyHome.tsx','company'],['src/components/CompanyNotifications.tsx','notices'],['src/components/PickupConfirmation.tsx','pickup-ui'],['src/components/MaterialsMap.native.tsx','native-map'],['src/services/pickup-state.ts','pickup-state'],
  ['src/services/coordinate-input.ts','coordinates'], ['src/components/PublishForm.tsx','publish'], ['src/services/material-categories.ts','categories'],
  ['src/constants/brand.ts','brand'], ['src/services/catalog-model.ts','catalog'], ['src/services/material-symbol.ts','symbol'],
  ['src/components/MaterialCard.tsx','card'], ['src/components/MaterialDetailsModal.tsx','modal'],
  ['src/app/(tabs)/index.tsx','home'], ['src/app/(tabs)/explore.tsx','explore'],
]) {
  const code=ts.transpileModule(await readFile(new URL(`../${source}`,import.meta.url),'utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},
  }).outputText.replace(/from ['"]([^'"]+)['"]/g,(all,name)=>mapping[name]?`from '${pathToFileURL(mapping[name])}'`:all);
  await writeFile(`${temp}/${target}.mjs`,code);
}
const {store}=await import(pathToFileURL(fixture));
const {default:CompanyHome}=await import(pathToFileURL(`${temp}/company.mjs`));
const {default:CompanyNotifications}=await import(pathToFileURL(`${temp}/notices.mjs`));
const {default:NativeMap}=await import(pathToFileURL(`${temp}/native-map.mjs`));
const {default:Publish}=await import(pathToFileURL(`${temp}/publish.mjs`));
const {MATERIAL_CATEGORIES,materialCategory}=await import(pathToFileURL(`${temp}/categories.mjs`));
const {default:Home}=await import(pathToFileURL(`${temp}/home.mjs`));
const {default:Explore}=await import(pathToFileURL(`${temp}/explore.mjs`));
const offer={id:'post-1',author:'Empresa',material:'PET transparente',materialId:'pet-transparente',content:'',
  quantity:12,address:'Puebla',estado:'ofrecido',ofrecidoA:'reciclador',participantes:['empresa','reciclador']};
const button=(root,label)=>root.findAllByType('Button').find(node=>node.findAllByType('Text').some(text=>text.props.children===label));
const textExists=(root,part)=>root.findAllByType('Text').some(node=>typeof node.props.children==='string'&&node.props.children.includes(part));
let renderer;
async function open(Screen,post=offer,rol='Reciclador'){
  store.uid='reciclador';store.rol=rol;store.posts=[{...post}];store.requests=[];store.failure=null;store.wait=null;
  await act(async()=>{renderer=create(React.createElement(Screen));});
  const card=renderer.root.findAllByType('Button').find(node=>node.props.accessibilityLabel==='Ver publicación de PET transparente');
  assert.ok(card,'publication must be clickable');
  await act(async()=>{card.props.onPress();});
  assert.equal(renderer.root.findAllByType('Modal').length,1);
}
async function closeRenderer(){if(renderer){await act(async()=>renderer.unmount());renderer=null;}}
try{
  await test('all catalog IDs group into ten categories; categoriaId is authoritative for new documents',()=>{
    assert.equal(MATERIAL_CATEGORIES.length,10);
    const groups={papel:['Carton-corrugado','papel-mixtoYperiodico','papel-blancoOficina','tetraPak'],plasticos:['pet-transparente','pet-color','hdpe-pead','ldpe-películaPlastica','pp','ps','pvc','otrosPlasticos-multicapa'],vidrio:['vidrioAmbar','vidrioTransparente','vidrioVerde'],ferrosos:['chatarraFerrosaLigera','latasAcero-hojalata'],noFerrosos:['aluminioPerfiles-otrosObjetos','cobre-otrosMetales','latasAluminio'],organica:['cocina-alimentos','poda-jardin'],textiles:['ropa-telas','calzado'],madera:['tarima-maderaEmbalaje'],raee:['pequeñosAparatosElectronicos'],especial:['manejoEspecial']};
    for(const [category,ids] of Object.entries(groups))for(const id of ids)assert.equal(materialCategory({id,nombre:id,categoriaId:''}),category,id);
    for(const category of MATERIAL_CATEGORIES)assert.equal(materialCategory({id:'nuevo-documento',nombre:'Nuevo material',categoriaId:category.nombre}),category.id);
    assert.equal(materialCategory({id:'pet-viejo',nombre:'PET',categoriaId:'Metales No Ferrosos'}),'noFerrosos');
    assert.equal(materialCategory({id:'nuevo',nombre:'Sin categoría',categoriaId:''}),null);
  });
  await test('publish form reveals category materials, clears previous selection and handles an empty category',async()=>{
    store.materials=[{id:'papel-1',nombre:'Papel mixto',categoriaId:'Papel y Cartón'},{id:'pet-1',nombre:'PET transparente',categoriaId:'Plásticos'},{id:'nuevo-pet',nombre:'Material plástico nuevo',categoriaId:'Plásticos'}];
    await act(async()=>{renderer=create(React.createElement(Publish,{embedded:true}));});
    for(const category of MATERIAL_CATEGORIES)assert.ok(button(renderer.root,`${category.nombre} ${category.emoji}`));
    assert.equal(button(renderer.root,'Papel mixto'),undefined);assert.equal(button(renderer.root,'PET transparente'),undefined);
    await act(async()=>button(renderer.root,'Papel y Cartón 🗂️').props.onPress());
    assert.ok(button(renderer.root,'Papel mixto'));assert.equal(button(renderer.root,'PET transparente'),undefined);
    await act(async()=>button(renderer.root,'Papel mixto').props.onPress());
    assert.equal(button(renderer.root,'Publicar material').props.disabled,false);
    await act(async()=>button(renderer.root,'Plásticos ♻️').props.onPress());
    assert.equal(button(renderer.root,'Publicar material').props.disabled,true);
    assert.equal(button(renderer.root,'Papel mixto'),undefined);
    assert.ok(button(renderer.root,'PET transparente'));assert.ok(button(renderer.root,'Material plástico nuevo'));
    await act(async()=>button(renderer.root,'Vidrio 🪟').props.onPress());
    assert.ok(textExists(renderer.root,'No hay materiales disponibles en esta categoría.'));
    assert.equal(button(renderer.root,'Publicar material').props.disabled,true);
    await closeRenderer();store.materials=[];
  });
  await test('manual pasted coordinates fill separate fields and invalid paste keeps the previous location',async()=>{
    await act(async()=>{renderer=create(React.createElement(Publish,{embedded:true}));});
    const input=label=>renderer.root.findAllByType('TextInput').find(node=>node.props.accessibilityLabel===label);
    await act(async()=>input('Pegar coordenadas').props.onChangeText('19° 0′ 0″ N, 98° 0′ 0″ O'));
    await act(async()=>button(renderer.root,'Usar coordenadas pegadas').props.onPress());
    assert.equal(input('Latitud').props.value,'19');assert.equal(input('Longitud').props.value,'-98');
    assert.equal(input('Pegar coordenadas').props.value,'');
    await act(async()=>input('Pegar coordenadas').props.onChangeText('invalid coordinates'));
    await act(async()=>button(renderer.root,'Usar coordenadas pegadas').props.onPress());
    assert.ok(textExists(renderer.root,'No se reconoce el formato'));
    assert.equal(input('Latitud').props.value,'19');assert.equal(input('Longitud').props.value,'-98');
    await act(async()=>input('Longitud').props.onChangeText('-98.2062'));
    assert.equal(input('Pegar coordenadas').props.value,'');
    await closeRenderer();
  });
  for(const [name,Screen] of [['Mis publicaciones',CompanyHome],['Avisos',CompanyNotifications]]){
    await test(`${name}: pickup requires confirmation, cancel does not write; failed pickup permits retry`,async()=>{
      const reserved={...offer,uid:'empresa',estado:'apartado',apartadoPara:'reciclador'};
      store.pickups=[];store.failure=null;store.wait=null;
      await act(async()=>{renderer=create(React.createElement(Screen,{posts:[reserved],uid:'empresa',loading:false,error:'',retryError:'',retrying:null,onRetry:()=>{}}));});
      await act(async()=>button(renderer.root,'Confirmar recolección').props.onPress());
      await act(async()=>button(renderer.root,'Cancelar').props.onPress());assert.deepEqual(store.pickups,[]);
      await act(async()=>button(renderer.root,'Confirmar recolección').props.onPress());
      store.failure=new Error('No se pudo confirmar');
      await act(async()=>button(renderer.root,'Sí, ya fue recogido').props.onPress());
      assert.ok(textExists(renderer.root,'No se pudo confirmar'));
      store.failure=null;
      await act(async()=>button(renderer.root,'Sí, ya fue recogido').props.onPress());
      assert.deepEqual(store.pickups,['post-1','post-1']);assert.equal(button(renderer.root,'Confirmar recolección'),undefined);
      assert.ok(textExists(renderer.root,'Recolección confirmada'));await closeRenderer();
    });
  }
  await test('company controls are hidden for other owners and unreserved materials',async()=>{
    for(const post of [{...offer,uid:'empresa'},{...offer,uid:'otra',estado:'apartado',apartadoPara:'reciclador'},{...offer,uid:'empresa',estado:'recolectado'}]){
      await act(async()=>{renderer=create(React.createElement(CompanyHome,{posts:[post],uid:'empresa',loading:false,error:'',retryError:'',retrying:null,onRetry:()=>{}}));});
      assert.equal(button(renderer.root,'Confirmar recolección'),undefined);await closeRenderer();
    }
  });
  await test('native map removes only the collected publication after a realtime update',async()=>{
    const reserved={...offer,estado:'apartado',apartadoPara:'reciclador',ubicacion:{latitude:19,longitude:-98}};
    const other={...reserved,id:'post-2',material:'Cartón'};
    await act(async()=>{renderer=create(React.createElement(NativeMap,{posts:[reserved,other]}));});
    assert.equal(renderer.root.findAllByType('Marker').length,2);
    await act(async()=>renderer.update(React.createElement(NativeMap,{posts:[{...reserved,estado:'recolectado'},other]})));
    const markers=renderer.root.findAllByType('Marker');assert.equal(markers.length,1);assert.equal(markers[0].props.accessibilityLabel,'Cartón');
    await closeRenderer();
  });
  for(const [name,Screen] of [['Inicio',Home],['Explorar',Explore]]){
    await test(`${name}: publication click opens details and reserves through the shared service`,async()=>{
      await open(Screen);
      await act(async()=>{await button(renderer.root,'Apartar material').props.onPress();});
      assert.deepEqual(store.requests,[['post-1',true]]);
      assert.ok(textExists(renderer.root,'Material apartado a tu nombre'));
      assert.equal(button(renderer.root,'Apartar material'),undefined);
      await closeRenderer();
    });
    await test(`${name}: closing does not reject; explicit rejection uses the same service`,async()=>{
      await open(Screen);
      await act(async()=>button(renderer.root,'Cerrar').props.onPress());
      assert.equal(renderer.root.findAllByType('Modal').length,0);assert.deepEqual(store.requests,[]);
      await closeRenderer();await open(Screen);
      await act(async()=>{await button(renderer.root,'No lo quiero').props.onPress();});
      assert.deepEqual(store.requests,[['post-1',false]]);assert.ok(textExists(renderer.root,'Rechazaste esta oferta'));
      await closeRenderer();
    });
    await test(`${name}: already reserved, other recipient and non-recycler accounts cannot reserve`,async()=>{
      for(const [post,rol] of [[{...offer,estado:'apartado',apartadoPara:'reciclador'},'Reciclador'],[{...offer,ofrecidoA:'otro'},'Reciclador'],[offer,'Universidad']]){
        await open(Screen,post,rol);assert.equal(button(renderer.root,'Apartar material'),undefined);await closeRenderer();
      }
    });
  }
  await test('error feedback preserves the pending offer and permits retry',async()=>{
    await open(Home);store.failure=new Error('Oferta ya no disponible');
    await act(async()=>{await button(renderer.root,'Apartar material').props.onPress();});
    assert.ok(textExists(renderer.root,'Oferta ya no disponible'));
    assert.ok(button(renderer.root,'Apartar material'));await closeRenderer();
  });
  await test('pending transaction disables answers and prevents closing',async()=>{
    await open(Explore);let resolve;store.wait=new Promise(done=>resolve=done);
    await act(async()=>{void button(renderer.root,'Apartar material').props.onPress();});
    assert.equal(button(renderer.root,'No lo quiero').props.disabled,true);
    assert.equal(button(renderer.root,'Cerrar').props.disabled,true);
    await act(async()=>renderer.root.findByType('Modal').props.onRequestClose());
    assert.equal(renderer.root.findAllByType('Modal').length,1);
    await act(async()=>{resolve();await store.wait;});
    assert.ok(textExists(renderer.root,'Material apartado a tu nombre'));await closeRenderer();
  });
}finally{await closeRenderer();await rm(temp,{recursive:true,force:true});}
