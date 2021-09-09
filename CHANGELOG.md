# ChangeLog

## 1.1.19 2021-09-09

- Fixed an problem when there Model name is model.

## 1.1.17 2021-03-25

- Fixed an problem when there is a "*/" string in the annotaion.

## 1.1.16 2021-01-23

- Fixed the problem of resolve multi conditions AST.

## 1.1.15 2021-01-19

- Fixed the problem of accessing map or array with object's properties.

## 1.1.14 2021-01-05

- Fix duplicate class names..

## 1.1.13 2020-11-23

- Support `exec` mode.

## 1.1.12 2020-10-23

- Converting `Model` to `array` in a compatible way.

## 1.1.11 2020-10-21

- Feature: Supports getting values from "Map&List" with variables.

## 1.1.10 2020-09-29

- Using a compatible method to get the value from the array.
- Fix output path when moduleDir is `./` or `../`

## 1.1.9 2020-09-29

- Improved code generation.
- Support the latest features of dara parser.

## 1.1.8 2020-08-28

- Fix the error when the type of `expectedType` is array.
- Fix the error of `undefined class` when the file name is a keyword.

## 1.1.7 2020-08-26

- Improve the emit result of type on code comment.
- Fix the wrong emit result in `toMap` method.

## 1.1.6 2020-08-21

- Improve the emit result of autoload script.
- Fix the error when map has model type item.

## 1.1.5 2020-08-10

- Fixed the emit result of `map_access` AST node.
- Supported `array_access` AST node

## 1.1.4 2020-07-31

- Supported more data types.

## 1.1.3 2020-07-30

- `resolveTypeItem` supports float and long data types.

## 1.1.2 2020-07-30

- Fixed the error of require wrong package.

## 1.1.1 2020-07-28

- Supported generate `autoload.php` file.
- Optimization of type-related code generation results.
- Optimization of map data type code generation results.

## 1.1.0 2020-07-14

- Supported emit test files.
- Supported catch TeaError
- Optimization emit comment.
- Discard strongly typed types in PHP code.
- `ast.predefined` is no longer supported.

## 1.0.1 - 2020-06-23

- Fixed update emitter.config failure.

## 1.0.0 - 2020-06-17

> Initialization release of the `Darabonba Code Generator for PHP` Version 1.0.0 on NPM.
> See <https://www.npmjs.com/package/@darabonba/php-generator> for more information.
