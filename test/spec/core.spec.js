import { parse, findElementById } from '../TestHelper';

import SimpleDmn from '../fixtures/simple.dmn';

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
});
