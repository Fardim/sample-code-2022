
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'

export class CustomContextPadProvider extends ContextPadProvider {
    constructor(config: any, injector: any, eventBus: any, contextPad: any, modeling: any, elementFactory: any, connect: any, create: any, popupMenu: any, canvas: any, rules: any, translate: any) {
        super(config, injector, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate);
        this.modeling = modeling;
        this.connect = connect;
    }


    static $inject = ['config.contextPad', 'injector', 'eventBus', 'contextPad', 'modeling', 'elementFactory', 'connect', 'create', 'popupMenu', 'canvas', 'rules', 'translate'];

    modeling: any;
    connect: any;

    getContextPadEntries(element) {

        const result = super.getContextPadEntries(element);

        delete result.replace;
        delete result['append.end-event'];
        delete result['append.gateway'];
        delete result['append.append-task'];
        delete result['append.intermediate-event'];
        delete result['append.text-annotation'];
        delete result.connect;

        const rejection = 'reject';
        const forward = 'forward';
        const self = this;

        if (element.type === 'bpmn:UserTask') {

            // forward connection tool
            result[forward] = {
                group: forward,
                className: 'bpmn-icon-connection',
                title: 'Create a forward connection',
                action: {
                    click (event, bpmnelement) {
                        self.modeling.isRejection = false;
                        self.connect.start(event, bpmnelement)
                    },
                    dragstart (event, bpmnelement) {
                        self.modeling.isRejection = false;
                        self.connect.start(event, bpmnelement)
                    }
                }
            }

            // rejection connection tool
            result[rejection] = {
                group: rejection,
                className: 'bpmn-icon-connection-back',
                title: 'Create a rejection connection',
                action: {
                    click (event, bpmnelement) {
                        self.modeling.isRejection = true;
                        self.connect.start(event, bpmnelement)
                    },
                    dragstart (event, bpmnelement) {
                        self.modeling.isRejection = true;
                        self.connect.start(event, bpmnelement)
                    }
                }
            }
        } else if (element.type !== 'bpmn:SendTask'
                   && element.type !== 'bpmn:EndEvent'
                   && element.type !== 'bpmn:SequenceFlow') {
            // forward connection tool
            result[forward] = {
                group: forward,
                className: 'bpmn-icon-connection',
                title: 'Create a forward connection',
                action: {
                    click (event, bpmnelement) {
                        self.modeling.isRejection = false;
                        self.connect.start(event, bpmnelement)
                    },
                    dragstart (event, bpmnelement) {
                        self.modeling.isRejection = false;
                        self.connect.start(event, bpmnelement)
                    }
                }
            }
        }


        /*
        if (element.type === 'bpmn:SendTask') {
            delete result.connect;
        }
        */

        return result;

    }

    startConnect(event, element) {
        this.connect.start(event, element);
    }

}



