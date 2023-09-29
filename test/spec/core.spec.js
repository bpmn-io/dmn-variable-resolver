import { parse, findElementById } from '../TestHelper';

import SimpleDmn from '../fixtures/simple.dmn';
import RequiredDecisionDmn from '../fixtures/required-decision.dmn';

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


  it('should resolve required decision outputs', async function() {

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
            name: 'first'
          },
          {
            name: 'second'
          }
        ]
      }
    ]);
  });
});
