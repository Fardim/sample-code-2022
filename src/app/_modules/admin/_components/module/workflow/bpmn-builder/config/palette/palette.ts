

export class CustomPalette {
  constructor(private bpmnFactory: any, private create: any, private elementFactory: any, private palette: any, private translate, private globalConnect, private modeling, private canvas, private commandStack) {
    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      // bpmnFactory,
      create,
      elementFactory,
      globalConnect,
      modeling,
      commandStack
      // palette
      // translate
    } = this;

    /*
    function createTask(suitabilityScore) {
      return function (event) {
        const businessObject = bpmnFactory.create('bpmn:Task');

        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject
        });

        create.start(event, shape);
      }
    }
    */


    function createAction(type: string, group: string, className: string, title: string = null, options: any = {}) {
      function createListener(event: any) {
        const shape = elementFactory.createShape(Object.assign({ type }, options));
        if (options) {
          shape.businessObject.di.isExpanded = options.isExpanded;
        }
        create.start(event, shape);
      }

      return {
        group,
        className,
        title: title || 'Create ' + type.replace(/^bpmn\:/, ''),
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    }

    return {

      undo: {
        group: 'tools',
        className: 'bpmn-icon-undo',
        title: 'undo',
        action: {
          click(event) {
            commandStack.undo() ;
          }
        }
      },

      redo: {
        group: 'tools',
        className: 'bpmn-icon-redo',
        title: 'redo',
        action: {
          click(event) {
            commandStack.redo() ;
          }
        }
      },

      'create.start-event':
        createAction('bpmn:IntermediateCatchEvent', 'event', 'bpmn-icon-intermediate-event-catch-link','add a start step',
                    {eventDefinitionType:'bpmn:LinkEventDefinition'}),
      /*
        createAction('bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none','add', {eventDefinitionType:'bpmn:LinkEventDefinition'})
      'create.start-event':
        createAction('bpmn:Task', 'activity', 'bpmn-icon-task', 'Add a start step'),
        */

      'create.user-task':
        createAction('bpmn:UserTask', 'activity', 'bpmn-icon-user-task', 'Create an activity step'),

      'create.exclusive-gateway':
        createAction('bpmn:ExclusiveGateway', 'activity', 'bpmn-icon-gateway-xor', 'Create a determination step'),

      'create.email-task':
        createAction('bpmn:SendTask', 'activity', 'bpmn-icon-send-task', 'Create an email step'),

      'create.service-task':
        createAction('bpmn:ServiceTask', 'activity', 'bpmn-icon-service-task', 'Create a background step'),

      'create.end-event':
        createAction('bpmn:EndEvent', 'activity', 'bpmn-icon-end-event-terminate', 'Add an end step', {eventDefinitionType:'bpmn:TerminateEventDefinition'}),

      'forward-connection': {
          group: 'activity',
          className: 'bpmn-icon-connection',
          title: 'Add a forward connection',
          action: {
            click(event) {
              globalConnect.toggle(event);
            }
          }
        },

      'rejection-connection': {
          group: 'activity',
          className: 'bpmn-icon-connection-back',
          title: 'Add a rejection connection',
          action: {
            click(event) {
              // console.log(canvas)
              modeling.isRejection = true ;
              // console.log(modeling);
              globalConnect.toggle(event);
            }
          }
        }

    }
  }
}
const inject = '$inject' ;
CustomPalette[inject] = [ 'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate',
  'globalConnect',
  'modeling',
  'canvas',
  'commandStack'
];
