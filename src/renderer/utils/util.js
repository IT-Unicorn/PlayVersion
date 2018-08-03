import fs from 'fs'
import path from 'path'


//密码加密
export const compileStr = function (code){      
    let c=String.fromCharCode(code.charCodeAt(0)+code.length);
   for(let i=1;i<code.length;i++)
    {      
     c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1))
   }   
   return escape(c)  
}

//密码解密
export const uncompileStr = function (code){      
    code=unescape(code)  
    let c=String.fromCharCode(code.charCodeAt(0)-code.length)     
    for(let i=1;i<code.length;i++)
    {      
     c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1))    
    }      
    return c
}

export const DirectoryFiles = function(filePath){
    return walk(filePath)
}
function walk(dir) {
    let children = []
    fs.readdirSync(dir).forEach(function(filename){
        let fpath = path.join(dir,filename)
        var stat = fs.statSync(fpath)
        if (stat && stat.isDirectory()) {
            children = children.concat(walk(fpath))
        }
        else {
            children.push(fpath)
        }
    })
 
    return children
}

