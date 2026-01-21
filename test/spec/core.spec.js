import { parse, findElementById } from '../TestHelper';

import SimpleDmn from '../fixtures/simple.dmn';
import RequiredDecisionDmn from '../fixtures/required-decision.dmn';
import RequiredKnowledgeDmn from '../fixtures/required-knowledge.dmn';
import MissingNamesDmn from '../fixtures/missing-names.dmn';
import FunctionDefinitionDmn from '../fixtures/function-definition.dmn';

import { expect } from 'chai';

import { resolveVariables } from '../../lib';


describe('#resolveVariables', function() {

  it('should resolve available input data', async function() {

    // given
    const parsed = await parse(SimpleDmn);
    const element = findElementById(parsed, 'InputExpression_1'),
          inputData = findElementById(parsed, 'InputData_0wfh4a3');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Season',
        origin: inputData
      }
    ]);
  });


  it('should resolve required decision outputs with types', async function() {

    // given
    const parsed = await parse(RequiredDecisionDmn);
    const element = findElementById(parsed, 'InputExpression_1'),
          decision = findElementById(parsed, 'Decision_02osojf');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Required Decision',
        entries: [
          {
            name: 'first',
            detail: 'string'
          },
          {
            name: 'second',
            detail: 'boolean'
          }
        ],
        origin: decision
      }
    ]);
  });


  it('should resolve required decision single output with types', async function() {

    // given
    const parsed = await parse(RequiredDecisionDmn);
    const element = findElementById(parsed, 'LiteralExpression_1'),
          origin = findElementById(parsed, 'SingleOutput');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Single output',
        detail: 'string',
        origin
      }
    ]);
  });


  it('should resolve required knowledge from Decision to BKM with parameters', async function() {

    // given
    const parsed = await parse(RequiredKnowledgeDmn);
    const element = findElementById(parsed, 'Decision_1'),
          origin = findElementById(parsed, 'BKM_1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Business Knowledge Model',
        origin,
        type: 'function',
        params: [
          {
            name: 'first',
            type: 'number'
          },
          {
            name: 'second',
            type: 'string'
          },
          {
            name: 'no type'
          }
        ]
      }
    ]);
  });


  it('should resolve required knowledge from BKM to BKM', async function() {

    // given
    const parsed = await parse(RequiredKnowledgeDmn);
    const element = findElementById(parsed, 'BKM_1'),
          origin = findElementById(parsed, 'BKM_2');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'BKM_2',
        origin
      }
    ]);
  });


  it('should NOT provide variables without names', async function() {

    // given
    const parsed = await parse(MissingNamesDmn);
    const element = findElementById(parsed, 'Decision_1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.be.eql([
      {
        'name': 'One of many outputs without name',
        'entries': [
          {
            'name': 'named',
            'detail': 'string'
          }
        ],
        origin: findElementById(parsed, 'Decision_1ewlmt0')
      },
      {
        'name': 'Single unnamed output',
        'detail': 'string',
        origin: findElementById(parsed, 'Decision_0k841j8')
      }
    ]);
  });


  it('should resolve formal parameters of function definition', async function() {

    // given
    const parsed = await parse(FunctionDefinitionDmn);
    const element = findElementById(parsed, 'Bkm_1'),
          fn = element.get('encapsulatedLogic'),
          parameters = fn.get('formalParameter'),
          functionBody = fn.get('body');

    // when
    const variables = resolveVariables(functionBody);

    // then
    expect(variables).to.eql([
      {
        name: 'noType',
        origin: parameters[0]
      },
      {
        name: 'string',
        detail: 'string',
        origin: parameters[1]
      },
      {
        name: 'num',
        detail: 'number',
        origin: parameters[2]
      }
    ]);
  });
});
