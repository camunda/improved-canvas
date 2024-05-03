import Modeler from 'bpmn-js/lib/Modeler';

import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import BpmnJSColorPicker from 'bpmn-js-color-picker';

import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';

import { BpmnImprovedCanvasModule } from './lib';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1jv03a9" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.20.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.20.0">
  <bpmn:process id="Process_03hnww4" isExecutable="true" camunda:historyTimeToLive="180">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1nx1pi0</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1yizg79">
      <bpmn:incoming>Flow_1nx1pi0</bpmn:incoming>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1nx1pi0" sourceRef="StartEvent_1" targetRef="Activity_1yizg79" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_03hnww4">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1yizg79_di" bpmnElement="Activity_1yizg79">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1nx1pi0_di" bpmnElement="Flow_1nx1pi0">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

const modeler = new Modeler({
  container: '#container',
  keyboard: {
    bindTo: document
  },
  additionalModules: [
    ZeebeBehaviorsModule,
    BpmnImprovedCanvasModule,
    BpmnJSColorPicker,
    CreateAppendAnythingModule
  ],
  moddleExtensions: {
    zeebe: ZeebeModdle
  }
});

modeler.importXML(xml);