fixture('TestCafe Uncaught object Callsite Issue')
    .page('./page.html');

test('Test link removal', async t => {
    await t
        .click('#link')
        .click('#btn');
});
