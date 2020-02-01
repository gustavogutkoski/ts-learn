import Component from "./base-component.js";
import {DragTarget} from "../models/drag-drop.js";
import {autobind} from "../decorators/autobind.js";
import {Project, ProjectStatus} from "../models/project.js";
import ProjectItem from "./project-item.js";
import {projectState} from "../state/project-state.js";

export default class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: any[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listElement = this.element.querySelector('ul')!;
            listElement.classList.add('droppable');
        }
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.remove('droppable');
    }

    renderContent() {
        this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.renderProjects();
        });
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
}