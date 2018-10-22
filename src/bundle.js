const detective = require("detective");
const resolve = require("resolve").sync;
const fs = require("fs");
const path = require("path");

let ID = 0;
/**
 *
 *
 * @param {filePath*} filePath
 * @returns moduleObject{ id: 0,
                          filePath: '../src/test/a.js',
                          source: 'const hello = require(\'./b\');\r\n\r\nhello();',
                          requires: [ './b' ]
                        }
 */
function createModuleObject(filePath) {
  const source = fs.readFileSync(filePath, "utf-8");
  const requires = detective(source);
  const id = ID++;

  return {
    id,
    filePath,
    source,
    requires
  };
}
/**
 *
 *
 * @param {path*} entry
 * @returns modules[moduleObject]
 */
function getModules(entry) {
  const rootModule = createModuleObject(entry);
  // console.log(rootModule);
  const modules = [rootModule];

  for (const module of modules) {
    module.map = {};
    module.requires.forEach(dependency => {
      const basedir = path.dirname(module.filePath);
      const dependencyPath = resolve(dependency, { basedir });
      const dependencyObject = createModuleObject(dependencyPath);

      module.map[dependency] = dependencyObject.id;
      modules.push(dependencyObject);
    });
  }
  // console.log(modules);
  return modules;
}
/**
 *
 *
 * @param {modules*} modules[]
 * @returns String 
 */
function pack(modules) {
  // console.log(modules)
  const modulesSource = modules.map(module => 
      `${module.id}:{
            factory:(module , require) {
                ${module.source}
            },
            map:${JSON.stringify(module.map)}
        }`).join();
  console.log(modulesSource)

  return `(modules => {
        const require = id => {
            const { factory, map } = modules[id]
            const localRequire = name => require(map(name))
            const module = { exports: {} }

            factory(module, localRequire)

            return module.exports
        }

        require(0)
  })({ ${ modulesSource })`;
}

module.exports = entry => pack(getModules(entry));