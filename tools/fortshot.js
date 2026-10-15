const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:300}});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{window.NOFX=1});
await p.evaluate(()=>{document.body.innerHTML='<div style="width:400px">'+fortSVG().replace('class="shipsvg','style="width:400px" class="shipsvg')+'</div>'});
await p.screenshot({path:process.argv[2]});await b.close()})()
