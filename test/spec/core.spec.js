import { parse, findElementById } from '../TestHelper';

import SimpleDmn from '../fixtures/simple.dmn';
import RequiredDecisionDmn from '../fixtures/required-decision.dmn';
import RequiredKnowledgeDmn from '../fixtures/required-knowledge.dmn';

import { resolveVariables } from '../../lib';

describe('#resolveVariables', function() {

  it('should resolve available input data', async function() {

    // given
    const parsed = await parse(SimpleDmn);
    const element = findElementById(parsed, 'InputExpression_1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Season'
      }
    ]);
  });


  it('should resolve required decision outputs with types', async function() {

    // given
    const parsed = await parse(RequiredDecisionDmn);
    const element = findElementById(parsed, 'InputExpression_1');

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
        ]
      }
    ]);
  });


  it('should resolve required decision outputs with types', async function() {

    // given
    const parsed = await parse(RequiredDecisionDmn);
    const element = findElementById(parsed, 'LiteralExpression_1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Single output',
        detail: 'string'
      }
    ]);
  });


  it('should resolve required knowledge to BKM', async function() {

    // given
    const parsed = await parse(RequiredKnowledgeDmn);
    const element = findElementById(parsed, 'Decision_1');

    // when
    const variables = resolveVariables(element);

    // then
    expect(variables).to.eql([
      {
        name: 'Business Knowledge Model'
      }
    ]);
  });
});
