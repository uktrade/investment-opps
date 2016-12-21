/* jshint ignore:start*/
describe('Article.html content tags', function() {
  var html = render('article.html');
  var fields = parseCmsTags(html);
  var sections = fields['sections'];

  it('should have "sections" defined',function() {
    expect(sections).not.toBe(undefined);
  });

  it('"sections" should be defined as multiple',function() {
    expect(sections.multiple).toBe(true);
  });

  it('"sections" should be of type content',function() {
    expect(sections.type).toBe('content');
  });

  it('"sections" should have a label defined',function() {
    expect(sections.label).toBeDefined();
  });

});
/* jshint ignore:end*/

