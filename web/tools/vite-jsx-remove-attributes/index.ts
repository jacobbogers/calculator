import { createFilter } from '@rollup/pluginutils';
import { generate } from 'astring';
import { SourceMapGenerator } from 'source-map';
import type { Plugin } from 'vite';
import type { FilterPattern } from '@rollup/pluginutils';
import type { Node as AcornNode } from 'acorn';
// @ts-ignore
import jxpath from '@mangos/jxpath';

export interface Options {
    attributes: string[];
    include?: FilterPattern;
    exclude?: FilterPattern;
}

export default function VitePluginJSXRemoveAttributes({
    include = [/App\.tsx$/],
    exclude = ['**/node_modules/**'],
    attributes
}: Options): Plugin {
    const filterValidFile = createFilter(include, exclude);

    return {
        name: 'vite-plugin-jsx-remove-attributes',
        // "apply" is vite specific annotation, invoke during "build" or "serve" phase
        apply: 'build',
        transform(code: string, id: string) {
            if (!(filterValidFile(id) && process.env.NODE_ENV === 'production')) {
                return null;
            }
            const ast = this.parse(code, {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ranges: true,
                locations: false
            });
            // @ts-ignore
            const jsxHavingTestId = Array.from(
                jxpath('/**/properties/[type=Property]/key/[type=Literal]/[value=data-testid]/../../properties/..', ast)
            ) as AcornNode[];
            // make references unique
            for (let i = 0; i < jsxHavingTestId.length; i++) {
                for (;;) {
                    const doubleFound = jsxHavingTestId.indexOf(jsxHavingTestId[i], i + 1);
                    if (doubleFound >= 0) {
                        jsxHavingTestId.splice(doubleFound, 1);
                        continue;
                    }
                    break;
                }
            }
            for (let i = jsxHavingTestId.length - 1; i >= 0; i--) {
                const jsx: AcornNode = jsxHavingTestId[i];
                // @ts-ignore
                for (let j = jsx.properties.length - 1; j >= 0; j--) {
                    // @ts-ignore
                    const prop = jsx.properties[j];
                    if (
                        prop.type === 'Property' &&
                        prop.key.type === 'Literal' &&
                        attributes.includes(prop.key.value)
                    ) {
                        // @ts-ignore
                        jsx.properties.splice(j, 1);
                    }
                }
            }
            const map = new SourceMapGenerator({ file: id });
            const formattedCode = generate(ast, { sourceMap: map });
            return { code: formattedCode, map: map.toString() };
        }
    };
}
