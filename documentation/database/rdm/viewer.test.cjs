// Run: node documentation/database/rdm/viewer.test.cjs
const assert = require('node:assert/strict');
const {relationships, cardinalities, relationshipSvg, tableSvg, wrap, connectedLayout, connectedSvg} = require('./viewer.js');
const parent = {schema:'core',name:'account',columns:[{name:'account_id',type:'uuid',nullable:false}],primaryKey:['account_id'],foreignKeys:[],uniqueKeys:[]};
const child = {schema:'core',name:'purok_account',columns:[{name:'account_id',type:'uuid',nullable:false},{name:'optional_id',type:'uuid',nullable:true}],primaryKey:['account_id'],uniqueKeys:[],foreignKeys:[{name:'purok_account_account_fk',columns:['account_id'],targetSchema:'core',targetTable:'account',targetColumns:['account_id']}]};
const edges = relationships([parent,child],'core.account');
assert.equal(edges.length,1);
assert.deepEqual(cardinalities(edges[0]),{parent:'1',child:'0..1'});
const optional = {...edges[0],fk:{...edges[0].fk,columns:['optional_id']}};
assert.deepEqual(cardinalities(optional),{parent:'0..1',child:'0..N'});
const composite = {...edges[0],fk:{...edges[0].fk,columns:['account_id','optional_id'],targetColumns:['account_id','account_id']}};
assert.deepEqual(cardinalities(composite),{parent:'0..1',child:'0..1'});
assert.equal(relationships([parent,child],'missing.table').length,0);
assert.equal(wrap('very_long_attribute_name_that_must_wrap',12).join(''),'very_long_attribute_name_that_must_wrap');
for (const svg of [relationshipSvg(edges,'core.account'),tableSvg(child)]) {
  assert.match(svg,/font-size="24"/);
  assert.match(svg,/stroke-width="5"/);
  assert.match(svg,/text-decoration="underline"/);
  assert.match(svg,/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.doesNotMatch(svg,/undefined|NaN/);
}
assert.doesNotMatch(tableSvg(child,false),/>FK<\/tspan>/);
assert.match(tableSvg({...child,name:'unsafe<&name'}),/unsafe&lt;&amp;name/);
console.log('RDM viewer checks passed: relationship discovery, optionality, unique/composite keys, SVG format, escaping.');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'schema-data.js'),'utf8'),sandbox);
const catalog = sandbox.window.SCHEMA_DATA;
const layout = connectedLayout(catalog.tables);
const svg = connectedSvg(catalog.tables);
const expectedFks = catalog.tables.flatMap(t=>t.foreignKeys||[]).length;
assert.equal(catalog.tables.length,73,'Expected complete current catalog');
assert.equal(expectedFks,138,'Expected all current foreign keys');
assert.equal(layout.nodes.length,catalog.tables.length);
assert.equal(layout.edges.length,expectedFks);
assert.equal((svg.match(/data-rdm-node=/g)||[]).length,73);
assert.equal((svg.match(/data-rdm-edge=/g)||[]).length,138);
assert.equal(new Set(layout.nodes.map(n=>`${n.table.schema}.${n.table.name}`)).size,73);
assert.equal(new Set(layout.edges.map(e=>e.id)).size,138);
for(const node of layout.nodes) {
  assert.ok(node.x>=0 && node.y>=0 && node.x+node.width<=layout.width && node.y+node.height<=layout.height,'Node stays within export');
  const keys=new Set([...(node.table.primaryKey||[]),...(node.table.foreignKeys||[]).flatMap(f=>f.columns)]);
  assert.deepEqual(new Set(node.rows.map(r=>r.column.name)),keys,'Every PK and FK attribute appears in its node');
}
for(const edge of layout.edges) {
  const tokens=edge.path.match(/[MHV]|-?\d+(?:\.\d+)?/g);
  let x=0,y=0;
  while(tokens.length) {
    const command=tokens.shift(),oldX=x,oldY=y;
    if(command==='M'){x=Number(tokens.shift());y=Number(tokens.shift());}
    else if(command==='H')x=Number(tokens.shift());
    else if(command==='V')y=Number(tokens.shift());
    assert.ok(x>=0&&x<=layout.width&&y>=0&&y<=layout.height,`${edge.id} connector stays within export`);
    if(command!=='M')for(const node of layout.nodes) {
      const through=command==='H'?y>node.y&&y<node.y+node.height&&Math.max(oldX,x)>node.x&&Math.min(oldX,x)<node.x+node.width:x>node.x&&x<node.x+node.width&&Math.max(oldY,y)>node.y&&Math.min(oldY,y)<node.y+node.height;
      assert.equal(through,false,`${edge.id} connector must not cross through ${node.table.name}`);
    }
  }
}
const focused=connectedSvg(catalog.tables,{domain:catalog.tables[0].group,focus:'public.account',showFk:false});
assert.equal((focused.match(/data-rdm-node=/g)||[]).length,73,'Highlight retains every node');
assert.equal((focused.match(/data-rdm-edge=/g)||[]).length,138,'Highlight retains every edge');
assert.doesNotMatch(focused,/>FK<\/tspan>/);
assert.match(svg,/font-size="24"/);
assert.match(svg,/stroke-width="5"/);
assert.doesNotMatch(svg,/undefined|NaN/);
console.log(`Connected RDM checks passed: ${layout.nodes.length} nodes, ${layout.edges.length} edges, all keys, complete highlight/export, in-bounds geometry and no connectors through tables.`);
