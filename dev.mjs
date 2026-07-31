import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path'
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'}
http.createServer(async(req,res)=>{try{const p=path.join(process.cwd(),req.url==='/'?'index.html':req.url.split('?')[0]);const data=await readFile(p);res.setHeader('content-type',types[path.extname(p)]||'application/octet-stream');res.end(data)}catch{res.statusCode=404;res.end('Not found')}}).listen(4173,()=>console.log('http://localhost:4173'))
