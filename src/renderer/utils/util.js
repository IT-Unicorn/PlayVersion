//密码加密
export const compileStr = function (code){      
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);
   for(var i=1;i<code.length;i++)
    {      
     c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1))
   }   
   return escape(c)  
}

//密码解密
export const uncompileStr = function (code){      
    code=unescape(code)  
    var c=String.fromCharCode(code.charCodeAt(0)-code.length)     
    for(var i=1;i<code.length;i++)
    {      
     c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1))    
    }      
    return c
}