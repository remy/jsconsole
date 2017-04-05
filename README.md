# JS Console

Fork from https://github.com/remy/jsconsole

用法:

1.	运行`node server ${port}`  
2.  在打开的页面输入`:listen ${debug_id}`  
3.  将提示注入的脚本添加到待调试的页面中  

在原有项目上添加了`server.js`，并且对输出的json数据进行的友好的展示

### Issue
* 只能支持`console.log`方法
