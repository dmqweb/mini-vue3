// node服务器，处理浏览器加载各种资源的请求
// 1.index.html
// 2.js
// 3.vue

// koa
const Koa = require("koa"); //vite启动时会启动一个开发服务器
// 创建实例
const app = new Koa();
const fs = require("fs");
const path = require("path");

const compilerDOM = require("@vue/compiler-dom"); //将template模板编译为render函数
const compilerSFC = require("@vue/compiler-sfc"); //将单文件组件编译为组件对象

// 中间件配置
// 处理路由
app.use(async (ctx) => {
  const { url, query } = ctx.request;
  // 首页请求
  if (url === "/") { //如果是主页面加载html文件
    // 加载index.html
    ctx.type = "text/html";
    ctx.body = fs.readFileSync(path.join(__dirname, "./index.html"), "utf8");
  } else if (url.endsWith(".js")) { //html文件会请求js文件
    // js文件加载处理
    const p = path.join(__dirname, url);
    console.log(p);
    ctx.type = "application/javascript";
    ctx.body = rewriteImport(fs.readFileSync(p, "utf8"));//将import路径进行修改
  } else if (url.startsWith("/@modules/")) { //如果查找的是@modules模块，则去node_modules中查找
    // 裸模块名称
    const moduleName = url.replace("/@modules/", "");
    // 去node_modules目录中找
    const prefix = path.join(__dirname, "../node_modules", moduleName);
    // package.json中获取module字段
    const module = require(prefix + "/package.json").module;
    const filePath = path.join(prefix, module);
    const ret = fs.readFileSync(filePath, "utf8");
    ctx.type = "application/javascript";
    ctx.body = rewriteImport(ret); //将裸模块进行替换
  } else if (url.indexOf(".vue") > -1) { //查找vue.js
    // 获取加载文件路径
    const p = path.join(__dirname, url.split("?")[0]);
    const ret = compilerSFC.parse(fs.readFileSync(p, "utf8"));
    if (!query.type) {
      // SFC请求
      // 读取vue文件，解析为js
      // 获取脚本部分的内容
      const scriptContent = ret.descriptor.script.content;
      // 替换默认导出为一个常量，方便后续修改
      const script = scriptContent.replace(
        "export default ",
        "const __script = "
      );
      ctx.type = "application/javascript";
      ctx.body = `
        ${rewriteImport(script)}
        // 解析tpl
        import {render as __render} from '${url}?type=template'
        __script.render = __render
        export default __script
      `;
    } else if (query.type === "template") { //查找.vue文件
      const tpl = ret.descriptor.template.content;
      // 编译为render
      const render = compilerDOM.compile(tpl, { mode: "module" }).code;
      ctx.type = "application/javascript";
      ctx.body = rewriteImport(render);
    }
  }
});

// 裸模块地址重写
// import xx from 'vue'
// import xx from '/@modules/vue'
function rewriteImport(content) {
  //匹配到 from [].vue等后缀
  return content.replace(/ from ['"](.*)['"]/g, function (s1, s2) {
    if (s2.startsWith("./") || s2.startsWith("/") || s2.startsWith("../")) {
      return s1;
    } else {
      // 裸模块，替换
      return ` from '/@modules/${s2}'`;
    }
  });
}

app.listen(3000, () => {
  console.log("kvite startup!!");
});
