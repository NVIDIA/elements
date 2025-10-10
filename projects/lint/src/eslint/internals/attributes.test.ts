import { describe, it, expect } from 'vitest';
import { recommendedNveTextValue, recommendedNveLayoutValue } from './attributes.js';

describe('recommendedNveTextValues', () => {
  it('should return original values if there are possible value bindings', () => {
    expect(recommendedNveTextValue('${value}')).toEqual('${value}');
    expect(recommendedNveTextValue('{{value}}')).toEqual('{{value}}');
    expect(recommendedNveTextValue('{{ value }}')).toEqual('{{ value }}');
    expect(recommendedNveTextValue('{%value%}')).toEqual('{%value%}');
    expect(recommendedNveTextValue('{% value %}')).toEqual('{% value %}');
  });

  it('should return same values if they are valid', () => {
    expect(recommendedNveTextValue('body')).toEqual('body');
    expect(recommendedNveTextValue('body sm')).toEqual('body sm');
  });

  it('should return a best guess match for invalid types', () => {
    expect(recommendedNveTextValue('heading-1')).toEqual('heading');
    expect(recommendedNveTextValue('heading:1')).toEqual('heading');
    expect(recommendedNveTextValue('heading-2')).toEqual('heading');
    expect(recommendedNveTextValue('heading:2')).toEqual('heading');
  });

  it('should return a best guess match for invalid sizes', () => {
    expect(recommendedNveTextValue('heading small')).toEqual('heading sm');
    expect(recommendedNveTextValue('heading large')).toEqual('heading lg');
    expect(recommendedNveTextValue('body small')).toEqual('body sm');
    expect(recommendedNveTextValue('body large')).toEqual('body lg');
  });

  it('should return a best guess match for invalid defaults', () => {
    expect(recommendedNveTextValue('default')).toEqual('body');
  });

  it('should return a best guess match for invalid case sensitive values', () => {
    expect(recommendedNveTextValue('Heading LG')).toEqual('heading lg');
    expect(recommendedNveTextValue('Body SM')).toEqual('body sm');
    expect(recommendedNveTextValue('Label')).toEqual('label');
    expect(recommendedNveTextValue('List')).toEqual('list');
    expect(recommendedNveTextValue('Code')).toEqual('code');
    expect(recommendedNveTextValue('Link')).toEqual('link');
  });
});

describe('recommendedNveLayoutValues', () => {
  it('should return original values if there are possible value bindings', () => {
    expect(recommendedNveLayoutValue('${value}')).toEqual('${value}');
    expect(recommendedNveLayoutValue('{{value}}')).toEqual('{{value}}');
    expect(recommendedNveLayoutValue('{{ value }}')).toEqual('{{ value }}');
    expect(recommendedNveLayoutValue('{%value%}')).toEqual('{%value%}');
    expect(recommendedNveLayoutValue('{% value %}')).toEqual('{% value %}');
  });

  it('should return same values if they are valid', () => {
    expect(recommendedNveLayoutValue('column')).toEqual('column');
    expect(recommendedNveLayoutValue('column gap:sm')).toEqual('column gap:sm');
  });

  it('should return null if there are unknown values with no suggestions', () => {
    expect(recommendedNveLayoutValue('unknown')).toEqual(null);
    expect(recommendedNveLayoutValue('unknown gap:sm')).toEqual(null);
  });

  it('should return common synonyms', () => {
    expect(recommendedNveLayoutValue('stack')).toEqual('column');
    expect(recommendedNveLayoutValue('col')).toEqual('column');
    expect(recommendedNveLayoutValue('inline')).toEqual('row');
    expect(recommendedNveLayoutValue('wrap')).toEqual('align:wrap');
    expect(recommendedNveLayoutValue('stretch')).toEqual('align:stretch');
    expect(recommendedNveLayoutValue('center')).toEqual('align:center');
  });

  it('should return a best guess match for invalid values', () => {
    expect(recommendedNveLayoutValue('gap-lg')).toEqual('gap:lg');
    expect(recommendedNveLayoutValue('gap:small')).toEqual('gap:sm');
    expect(recommendedNveLayoutValue('column gap:small')).toEqual('column gap:sm');
    expect(recommendedNveLayoutValue('column gap:large')).toEqual('column gap:lg');
    expect(recommendedNveLayoutValue('padding:lg')).toEqual('pad:lg');
    expect(recommendedNveLayoutValue('padding-top:lg')).toEqual('pad-top:lg');
    expect(recommendedNveLayoutValue('row padding:sm')).toEqual('row pad:sm');
    expect(recommendedNveLayoutValue('row padding-right:lg')).toEqual('row pad-right:lg');
  });

  it('should return a best guess match for invalid alignment values', () => {
    expect(recommendedNveLayoutValue('column align-items:center')).toEqual('column align:center');
    expect(recommendedNveLayoutValue('row justify:space-between')).toEqual('row align:space-between');
    expect(recommendedNveLayoutValue('row gap:sm align:start')).toEqual('row gap:sm align:left');
    expect(recommendedNveLayoutValue('row gap:sm align:end')).toEqual('row gap:sm align:right');
    expect(recommendedNveLayoutValue('column gap:sm align:start')).toEqual('column gap:sm align:top');
    expect(recommendedNveLayoutValue('column gap:sm align:end')).toEqual('column gap:sm align:bottom');
  });

  it('should return a best guess match for invalid defaults', () => {
    expect(recommendedNveLayoutValue('default')).toEqual('column');
  });

  it('should return a best guess match for invalid case sensitive values', () => {
    expect(recommendedNveLayoutValue('Column Gap:Lg')).toEqual('column gap:lg');
    expect(recommendedNveLayoutValue('Row Gap:sm')).toEqual('row gap:sm');
    expect(recommendedNveLayoutValue('Column Align:Center')).toEqual('column align:center');
    expect(recommendedNveLayoutValue('Row Align:Stretch')).toEqual('row align:stretch');
    expect(recommendedNveLayoutValue('Column Pad:Lg')).toEqual('column pad:lg');
    expect(recommendedNveLayoutValue('Row Pad:Sm')).toEqual('row pad:sm');
  });

  it('should return a best guess match for invalid grid values', () => {
    expect(recommendedNveLayoutValue('grid grid-cols:6')).toEqual('grid span-items:6');
    expect(recommendedNveLayoutValue('grid gap:md grid-cols:4')).toEqual('grid gap:md span-items:4');
  });
});
