import typescript from '@rollup/plugin-typescript'
import packageJson from './package.json' with {type: 'json'}

const dependencyTypes = ['peerDependencies', 'dependencies', 'devDependencies']
const dependencies = new Set(
  dependencyTypes.flatMap(type => {
    if (packageJson[type]) {
      return Object.keys(packageJson[type])
    }
    return []
  }),
)
const external = Array.from(dependencies).map(name => {
  return new RegExp(`^${name}(/.*)?`)
})

export default [
  // ESM
  {
    input: ['src/index.ts', 'src/utils/index.ts'],
    external,
    plugins: [
      typescript(),
      {
        id: 'emit-package-json-file',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            source: JSON.stringify({type: 'module'}),
            fileName: 'package.json',
          })
        },
      },
    ],
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs',
    },
  },

  // CommonJs
  {
    input: ['src/index.ts', 'src/utils/index.ts'],
    external,
    plugins: [
      typescript({
        outDir: 'dist/cjs',
      }),
    ],
    output: {
      dir: 'dist/cjs',
      format: 'commonjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  },
]
