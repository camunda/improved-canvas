import {
  HighContrastCanvasModule,
  BpmnImprovedCanvasModule,
  DmnImprovedCanvasModule
} from '../../dist';

describe('bundle', function() {

  it('should expose HighContrastCanvasModule', function() {
    expect(HighContrastCanvasModule).to.exist;
  });


  it('should expose BpmnImprovedCanvasModule', function() {
    expect(BpmnImprovedCanvasModule).to.exist;
  });


  it('should expose DmnImprovedCanvasModule', function() {
    expect(DmnImprovedCanvasModule).to.exist;
  });

});