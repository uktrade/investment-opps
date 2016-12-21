/* jshint ignore:start*/
describe('industry.html content tags', function() {
  var html = render('industry.html');
  var fields = parseCmsTags(html);
  var sections = fields['sections'];
  var subContent = fields['subContent'];

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

  it('should have "subContent" defined as multiple content', function(){
    expect(subContent).toBeDefined();
    expect(subContent.type).toBe('content');
    expect(subContent.multiple).toBe(true);
  });

    it('"subContent" should have thumbnail and link defined', function(){
    var thumbnail = subContent.fields.thumbnail;
    var link = subContent.fields.link;
    expect(link).toBeDefined();
    expect(link.type).toBe('text');
  });

});
/* jshint ignore:end*/

