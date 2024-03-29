import { parse, findElementById } from '../TestHelper';

import SimpleDmn from '../fixtures/simple.dmn';
import RequiredDecisionDmn from '../fixtures/required-decision.dmn';
import RequiredKnowledgeDmn from '../fixtures/required-knowledge.dmn';
import MissingNamesDmn from '../fixtures/missing-names.dmn';

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


  it('should resolve required decision outputs with types', async function() {

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


  it('should resolve required knowledge to BKM', async function() {

    // given
    const parsed = await parse(RequiredKnowledgeDmn);
    const element = findElementById(parsed, 'Decision_1'),
          origin = findElementById(parsed, 'BusinessKnowledgeModel_1yhkda1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Business Knowledge Model',
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
});
