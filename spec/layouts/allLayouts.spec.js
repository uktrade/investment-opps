var path = require('path')
describe('All layouts tags', function() {
  loopLayouts(function(file) {
    describe(path.basename(file) + ' cms tags', function() {
      var html = render(file)
      var fields = parseCmsTags(html)
      var pageHeader = fields['pageHeader']
      it('should define pageHeader', function() {
        expect(pageHeader).toBeDefined()
      })

      it('pageHeader should be of type content with label', function() {
        expect(pageHeader.type).toBe('content')
      })

      it('pageHeader should have optional heroImage field definition with a label', function() {
        var heroImage = pageHeader.fields.heroImage
        expect(heroImage).toBeDefined()
        expect(heroImage.type).toBe('text')
        expect(heroImage.label).toBeDefined()
        expect(heroImage.required).not.toBe(true)
      })

      it('pageHeader should have optional heroVideo field definition with a label', function() {
        var heroVideo = pageHeader.fields.heroVideo
        expect(heroVideo).toBeDefined()
        expect(heroVideo.type).toBe('text')
        expect(heroVideo.required).not.toBe(true)
      })

      it('pageHeader should have optional externalVideo field definition with a label', function() {
        var field = pageHeader.fields.externalVideo
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.label).toBeDefined()
        expect(field.required).not.toBe(true)
      })

      it('pageHeader should have optional heroVideoImage field definition with a label', function() {
        var field = pageHeader.fields.heroVideoImage
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.label).toBeDefined()
        expect(field.required).not.toBe(true)
      })
    })
  })
})
