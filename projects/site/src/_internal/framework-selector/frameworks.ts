import { svg } from 'lit';

import type { CodeBlock } from '@nvidia-elements/code/codeblock';

export const FRAMEWORKS = [
  {
    id: 'angular',
    label: 'Angular',
    logo: svg`<symbol id="angular" viewBox="0 0 64 64">
      <path d="M32.143 6 8 15.286l3.714 31.571L32.143 58 52.57 46.857l3.715-31.571L32.143 6Z" fill="#DD0031"/>
      <path d="M32.143 6v52L52.57 46.857l3.715-31.571L32.143 6Z" fill="#C3002F"/>
      <path d="M32.142 11.745 17.05 45.675h5.627l3.034-7.592h12.81l3.035 7.593h5.627l-15.04-33.93Zm4.409 21.658h-8.817l4.408-10.633 4.409 10.633Z" fill="#fff"/>
    </symbol>`,
    example: {
      language: 'html',
      code: `<!-- Angular - tasks-grid.component.html -->

<nve-card>

  <nve-card-header>
    <h2 nve-text="heading sm bold">Pending Tasks</h2>
  </nve-card-header>

  <nve-grid container="flat">

    <nve-grid-header>
      <nve-grid-column>ID</nve-grid-column> 
      <nve-grid-column>Task</nve-grid-column>
      <nve-grid-column>Status</nve-grid-column>
    </nve-grid-header>
    
    <nve-grid-row *ngFor="let task of tasks; trackBy: trackById">
      <nve-grid-cell>{{ task.id }}</nve-grid-cell>
      <nve-grid-cell>{{ task.name }}</nve-grid-cell>
      <nve-grid-cell>
        <nve-badge [status]="task.status">
          {{ task.status }}
        </nve-badge>
      </nve-grid-cell>
    </nve-grid-row>

  </nve-grid>

</nve-card>`
    }
  },
  {
    id: 'go',
    label: 'Go',
    logo: svg`<symbol id="go" viewBox="0 0 64 64">
      <g fill="#00ACD7" clip-path="url(#golang)">
        <path d="M6.452 27.654c-.115 0-.143-.057-.086-.143l.603-.774c.058-.086.201-.144.316-.144H17.54c.115 0 .144.086.086.172l-.488.746c-.058.086-.201.172-.288.172l-10.398-.029ZM2.115 30.293c-.115 0-.144-.057-.086-.143l.603-.774c.057-.087.201-.144.316-.144h13.098c.115 0 .173.086.144.172l-.23.689c-.029.114-.144.172-.258.172l-13.587.028ZM9.066 32.932c-.115 0-.143-.086-.086-.172l.402-.717c.058-.086.173-.172.287-.172h5.745c.115 0 .173.086.173.2l-.058.69c0 .114-.115.2-.2.2l-6.263-.029ZM38.882 27.138c-1.81.46-3.045.803-4.825 1.262-.431.115-.46.144-.834-.287-.43-.487-.746-.803-1.35-1.09-1.81-.889-3.561-.63-5.199.43-1.953 1.263-2.958 3.127-2.93 5.45.03 2.295 1.609 4.188 3.878 4.504 1.954.258 3.59-.43 4.883-1.893.259-.316.489-.66.776-1.062h-5.544c-.603 0-.747-.372-.546-.86.374-.89 1.063-2.38 1.465-3.127.087-.172.288-.459.718-.459H39.83c-.057.775-.057 1.55-.172 2.324-.316 2.065-1.092 3.958-2.356 5.622-2.068 2.725-4.768 4.417-8.186 4.876-2.815.373-5.429-.172-7.727-1.893-2.126-1.606-3.332-3.729-3.648-6.368-.373-3.126.546-5.937 2.442-8.404 2.039-2.668 4.74-4.36 8.042-4.962 2.7-.488 5.286-.172 7.612 1.405 1.523 1.004 2.614 2.381 3.332 4.045.173.258.058.401-.287.487Z"/>
        <path d="M48.39 43c-2.614-.057-4.998-.803-7.009-2.524-1.694-1.463-2.757-3.327-3.102-5.536-.517-3.241.373-6.11 2.327-8.662 2.097-2.754 4.624-4.188 8.042-4.79 2.93-.517 5.688-.23 8.187 1.463 2.27 1.548 3.677 3.642 4.05 6.396.488 3.872-.632 7.027-3.303 9.723-1.896 1.922-4.223 3.127-6.894 3.672-.776.143-1.551.172-2.298.258Zm6.836-11.588c-.028-.373-.028-.66-.086-.947-.517-2.84-3.13-4.445-5.86-3.814-2.67.602-4.394 2.294-5.026 4.99-.517 2.238.574 4.504 2.642 5.422 1.58.688 3.16.602 4.682-.172 2.27-1.176 3.505-3.012 3.648-5.479Z"/>
      </g>
      <defs>
        <clipPath id="golang"><path fill="#fff" d="M2 21h59v22H2z" /></clipPath>
      </defs>
    </symbol>`,
    example: {
      language: 'html',
      code: `<!-- Go + html/template - tasks-grid.html -->

<nve-card>

  <nve-card-header>
    <h2 nve-text="heading sm bold">Pending Tasks</h2>
  </nve-card-header>

  <nve-grid container="flat">

    <nve-grid-header>
      <nve-grid-column>ID</nve-grid-column>
      <nve-grid-column>Task</nve-grid-column>
      <nve-grid-column>Status</nve-grid-column>
    </nve-grid-header>

    {{range .Tasks}}
      <nve-grid-row>
        <nve-grid-cell>{{.ID}}</nve-grid-cell>
        <nve-grid-cell>{{.Name}}</nve-grid-cell>
        <nve-grid-cell>
          <nve-badge status="{{.Status | lower}}">
            {{.Status}}
          </nve-badge>
        </nve-grid-cell>
      </nve-grid-row>
    {{end}}

  </nve-grid>

</nve-card>`
    }
  },
  {
    id: 'lit',
    label: 'Lit',
    logo: svg`<symbol id="lit" viewBox="0 0 64 64">
      <path d="m21.4 37.2 5.2-15.6L50 45l-7.8 13-10.4-10.4h-5.2" fill="#00E8FF"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M31.8 47.6V26.8l10.4-10.4v20.8m-26 0h5.2l5.2 10.4L21.4 58 11 47.6l5.2-10.4Z" fill="#283198"/>
      <path d="M21.4 37.2V16.4L31.8 6v20.8M42.2 58V37.2l10.4-10.4v20.8m-41.6 0V26.8l10.4 10.4" fill="#324FFF"/>
      <path d="M21.4 58V37.2l10.4 10.4" fill="#0FF"/>
    </symbol>`,
    example: {
      language: 'typescript',
      code: `/* Lit - tasks-grid.ts */

@customElement('tasks-grid')
export class TasksGrid extends LitElement {
  @property({type: Array})
  tasks: Task[] = [];

  render() {
    return html\`
      <nve-card>
        <nve-card-header>
          <h2 nve-text="heading sm bold">Pending Tasks</h2>
        </nve-card-header>
        <nve-grid container="flat">
          <nve-grid-header>
            <nve-grid-column>ID</nve-grid-column>
            <nve-grid-column>Task</nve-grid-column>
            <nve-grid-column>Status</nve-grid-column>
          </nve-grid-header>
          \${this.tasks.map(task => html\`
            <nve-grid-row key=\${task.id}>
              <nve-grid-cell>\${task.id}</nve-grid-cell>
              <nve-grid-cell>\${task.name}</nve-grid-cell>
              <nve-grid-cell>
                <nve-badge status=\${task.status}>
                  \${task.status}
                </nve-badge>
              </nve-grid-cell>
            </nve-grid-row>
          \`)}
        </nve-grid>
      </nve-card>
    \`;
  }
}`
    }
  },
  {
    id: 'python',
    label: 'Python',
    logo: svg`<symbol id="python" viewBox="0 0 64 64">
      <path fill="url(#python-a)" d="M31.678 5c-2.226.01-4.353.2-6.224.528-5.511.967-6.512 2.991-6.512 6.724v4.93h13.025v1.643H14.054c-3.786 0-7.1 2.26-8.137 6.558-1.196 4.928-1.249 8.002 0 13.147.926 3.83 3.137 6.558 6.922 6.558h4.479v-5.91c0-4.27 3.72-8.036 8.136-8.036h13.01c3.622 0 6.513-2.96 6.513-6.573V12.252c0-3.505-2.978-6.139-6.513-6.724A40.9 40.9 0 0 0 31.68 5Zm-7.043 3.965c1.345 0 2.444 1.11 2.444 2.473a2.453 2.453 0 0 1-2.444 2.457 2.45 2.45 0 0 1-2.444-2.457c0-1.364 1.093-2.473 2.444-2.473Z"/>
      <path fill="url(#python-b)" d="M46.601 18.825v5.744c0 4.454-3.802 8.202-8.137 8.202h-13.01c-3.563 0-6.512 3.029-6.512 6.573V51.66c0 3.506 3.07 5.567 6.512 6.573 4.123 1.204 8.077 1.422 13.01 0 3.28-.943 6.513-2.84 6.513-6.573v-4.93h-13.01v-1.643h19.522c3.786 0 5.196-2.622 6.513-6.558 1.36-4.052 1.302-7.949 0-13.147-.936-3.742-2.723-6.558-6.513-6.558h-4.888Zm-7.317 31.193a2.45 2.45 0 0 1 2.444 2.457c0 1.364-1.094 2.473-2.444 2.473-1.345 0-2.444-1.11-2.444-2.473a2.453 2.453 0 0 1 2.444-2.457Z"/>
      <defs>
        <linearGradient id="python-a" x1="5" x2="34.859" y1="5" y2="30.621" gradientUnits="userSpaceOnUse">
          <stop stop-color="#5A9FD4"/>
          <stop offset="1" stop-color="#306998"/>
        </linearGradient>
        <linearGradient id="python-b" x1="38.971" x2="28.294" y1="52.061" y2="36.996" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFD43B"/>
          <stop offset="1" stop-color="#FFE873"/>
        </linearGradient>
      </defs>
    </symbol>`,
    example: {
      language: 'html',
      code: `<!-- Python + Flask - tasks-grid.html -->

<nve-card>

  <nve-card-header>
    <h2 nve-text="heading sm bold">Pending Tasks</h2>
  </nve-card-header>

  <nve-grid container="flat">

    <nve-grid-header>
      <nve-grid-column>ID</nve-grid-column>
      <nve-grid-column>Task</nve-grid-column>
      <nve-grid-column>Status</nve-grid-column>
    </nve-grid-header>

    {% for task in tasks %}
      <nve-grid-row>
        <nve-grid-cell>{{ task.id }}</nve-grid-cell>
        <nve-grid-cell>{{ task.name }}</nve-grid-cell>
        <nve-grid-cell>
          <nve-badge status="{{ task.status.lower() }}">
            {{ task.status }}
          </nve-badge>
        </nve-grid-cell>
      </nve-grid-row>
    {% endfor %}

  </nve-grid>

</nve-card>`
    }
  },
  {
    id: 'next-js',
    label: 'Next.js',
    logo: svg`<symbol id="next-js" viewBox="0 0 64 64">
      <path d="M30.294 6.014c-.112.01-.468.046-.788.071-7.385.666-14.302 4.65-18.683 10.775-2.44 3.405-4 7.268-4.59 11.359C6.026 29.647 6 30.069 6 32.005s.025 2.358.234 3.786c1.413 9.764 8.36 17.967 17.783 21.006 1.687.544 3.466.915 5.489 1.138.788.087 4.193.087 4.98 0 3.492-.386 6.45-1.25 9.367-2.74.447-.228.534-.289.473-.34-.04-.03-1.947-2.587-4.234-5.677l-4.157-5.616-5.21-7.71c-2.866-4.238-5.224-7.704-5.244-7.704-.02-.006-.041 3.42-.051 7.603-.015 7.323-.02 7.618-.112 7.791-.132.249-.234.35-.447.462-.163.082-.305.097-1.073.097h-.879l-.234-.147a.95.95 0 0 1-.34-.371l-.107-.229.01-10.19.015-10.195.158-.199c.081-.106.254-.244.376-.31.209-.101.29-.111 1.17-.111 1.036 0 1.209.04 1.478.335.076.081 2.897 4.33 6.272 9.448 3.374 5.118 7.99 12.106 10.256 15.537l4.117 6.236.208-.137c1.845-1.2 3.796-2.907 5.341-4.686a25.882 25.882 0 0 0 6.12-13.29c.208-1.429.233-1.85.233-3.787 0-1.936-.025-2.358-.233-3.786-1.413-9.763-8.36-17.966-17.784-21.006-1.662-.538-3.43-.91-5.412-1.133-.488-.05-3.848-.107-4.27-.066Zm10.642 15.725c.244.122.442.355.513.6.041.132.051 2.957.041 9.326l-.015 9.138-1.611-2.47-1.616-2.47V29.22c0-4.295.02-6.709.05-6.826.082-.284.26-.508.503-.64.209-.107.285-.117 1.083-.117.752 0 .884.01 1.052.102Z" fill="currentColor" />
    </symbol>`,
    example: {
      language: 'typescript',
      code: `/* Next.js - tasks-grid.tsx */

export default function TasksGrid({ tasks }: TasksPageProps) {
  return (
    <nve-card>

      <nve-card-header>
        <h2 nve-text="heading sm bold">Pending Tasks</h2>
      </nve-card-header>
  
      <nve-grid container="flat">

        <nve-grid-header>
          <nve-grid-column>ID</nve-grid-column>
          <nve-grid-column>Task</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
        </nve-grid-header>

        {tasks.map(task => (
          <nve-grid-row key={task.id}>
            <nve-grid-cell>{task.id}</nve-grid-cell>
            <nve-grid-cell>{task.name}</nve-grid-cell>
            <nve-grid-cell>
              <nve-badge status={task.status}>
                {task.status}
              </nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
        ))}

      </nve-grid>

    </nve-card>
  );
}`
    }
  },
  {
    id: 'preact',
    label: 'Preact',
    logo: svg`<symbol id="preact" viewBox="0 0 64 64">
      <path d="m31.517 6 22.517 13v26L31.517 58 9 45V19L31.517 6Z" fill="#673AB8"/>
      <path d="M15.133 44.785c2.994 3.831 12.507.912 21.488-6.105s14.115-15.541 11.122-19.373c-2.994-3.831-12.507-.912-21.488 6.105S12.14 40.953 15.133 44.785Zm1.28-1c-.994-1.27-.56-3.764 1.331-6.905 1.992-3.306 5.373-6.957 9.51-10.189 4.138-3.232 8.497-5.63 12.188-6.762 3.504-1.076 6.03-.893 7.022.377.993 1.271.56 3.765-1.332 6.906-1.992 3.306-5.373 6.957-9.51 10.19-4.137 3.231-8.497 5.629-12.187 6.761-3.505 1.076-6.03.893-7.023-.377Z" fill="#fff"/><path d="M47.743 44.785c2.993-3.832-2.14-12.356-11.122-19.373-8.981-7.017-18.495-9.936-21.488-6.105-2.993 3.832 2.14 12.356 11.122 19.373 8.981 7.017 18.494 9.936 21.488 6.105Zm-1.279-1c-.993 1.271-3.518 1.454-7.022.378-3.69-1.132-8.05-3.53-12.188-6.762-4.137-3.233-7.518-6.883-9.51-10.19-1.891-3.14-2.325-5.634-1.332-6.905.993-1.27 3.518-1.453 7.022-.378 3.69 1.133 8.05 3.53 12.188 6.763 4.137 3.232 7.518 6.883 9.51 10.19 1.891 3.14 2.325 5.634 1.332 6.904Z" fill="#fff"/>
      <path d="M31.438 35.495a3.448 3.448 0 1 0 0-6.897 3.448 3.448 0 0 0 0 6.897Z" fill="#fff"/>
    </symbol>`,
    example: {
      language: 'typescript',
      code: `/* Preact - tasks-grid.tsx */

export function TasksGrid({ tasks }: TasksGridProps) {
  return (
    <nve-card>

      <nve-card-header>
        <h2 nve-text="heading sm bold">Pending Tasks</h2>
      </nve-card-header>

      <nve-grid container="flat">

        <nve-grid-header>
          <nve-grid-column>ID</nve-grid-column>
          <nve-grid-column>Task</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
        </nve-grid-header>

        {tasks.map(task => (
          <nve-grid-row key={task.id}>
            <nve-grid-cell>{task.id}</nve-grid-cell>
            <nve-grid-cell>{task.name}</nve-grid-cell>
            <nve-grid-cell>
              <nve-badge status={task.status}>
                {task.status}
              </nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
        ))}

      </nve-grid>

    </nve-card>
  );
}`
    }
  },
  {
    id: 'react',
    label: 'React',
    logo: svg`<symbol id="react" viewBox="0 0 64 64">
      <path d="M58 32.16c0-3.445-4.314-6.71-10.928-8.734 1.526-6.741.848-12.105-2.14-13.822-.69-.403-1.495-.593-2.375-.593v2.363c.487 0 .88.096 1.208.276 1.442.827 2.067 3.974 1.58 8.024a32.626 32.626 0 0 1-.541 3.116 51.379 51.379 0 0 0-6.73-1.156 51.71 51.71 0 0 0-4.41-5.3c3.455-3.21 6.699-4.97 8.904-4.97V9c-2.915 0-6.731 2.078-10.59 5.681-3.857-3.582-7.673-5.639-10.588-5.639v2.364c2.194 0 5.448 1.749 8.904 4.94a50.068 50.068 0 0 0-4.378 5.288c-2.395.255-4.664.647-6.741 1.166a31.973 31.973 0 0 1-.551-3.073c-.498-4.05.116-7.197 1.547-8.035.318-.19.732-.275 1.22-.275V9.053c-.891 0-1.697.19-2.396.594-2.979 1.717-3.646 7.07-2.11 13.79C10.293 25.47 6 28.724 6 32.158c0 3.445 4.314 6.71 10.928 8.734-1.527 6.741-.848 12.105 2.14 13.822.69.402 1.495.593 2.386.593 2.915 0 6.73-2.077 10.588-5.681 3.858 3.582 7.674 5.639 10.59 5.639.89 0 1.695-.191 2.395-.594 2.978-1.717 3.646-7.07 2.109-13.79C53.707 38.859 58 35.595 58 32.16Zm-13.8-7.07a47.767 47.767 0 0 1-1.431 4.186 50.236 50.236 0 0 0-1.389-2.543 57.448 57.448 0 0 0-1.526-2.48 47.83 47.83 0 0 1 4.346.837Zm-4.855 11.288a56.498 56.498 0 0 1-2.554 4.049c-1.58.138-3.18.212-4.791.212-1.6 0-3.201-.074-4.77-.202a58.461 58.461 0 0 1-2.565-4.027 55.206 55.206 0 0 1-2.204-4.219c.657-1.42 1.399-2.84 2.194-4.229a56.498 56.498 0 0 1 2.554-4.049c1.58-.138 3.18-.212 4.791-.212 1.6 0 3.201.074 4.77.202a58.423 58.423 0 0 1 2.565 4.027 55.206 55.206 0 0 1 2.204 4.219c-.667 1.42-1.399 2.84-2.194 4.229ZM42.77 35a45.45 45.45 0 0 1 1.463 4.218c-1.389.34-2.852.626-4.367.848a58.59 58.59 0 0 0 1.526-2.512c.488-.848.943-1.706 1.378-2.554ZM32.02 46.31a43.693 43.693 0 0 1-2.946-3.392c.954.042 1.929.074 2.914.074.997 0 1.982-.021 2.947-.074a41.368 41.368 0 0 1-2.915 3.391Zm-7.886-6.244a47.79 47.79 0 0 1-4.345-.837c.392-1.367.88-2.777 1.43-4.187.435.848.89 1.696 1.39 2.544a70.1 70.1 0 0 0 1.525 2.48Zm7.833-22.057a43.693 43.693 0 0 1 2.947 3.392A65.61 65.61 0 0 0 32 21.327c-.996 0-1.982.021-2.947.074a41.368 41.368 0 0 1 2.915-3.392Zm-7.843 6.243a58.553 58.553 0 0 0-2.904 5.056 45.45 45.45 0 0 1-1.463-4.218 51.487 51.487 0 0 1 4.367-.838Zm-9.593 13.27c-3.752-1.6-6.179-3.698-6.179-5.363 0-1.664 2.427-3.773 6.18-5.363a32.658 32.658 0 0 1 2.935-1.07c.605 2.077 1.4 4.24 2.385 6.455a50.2 50.2 0 0 0-2.353 6.423 32.167 32.167 0 0 1-2.968-1.081Zm5.703 15.147c-1.442-.827-2.067-3.975-1.58-8.024.117-.996.308-2.045.541-3.116 2.077.509 4.346.901 6.73 1.155a51.71 51.71 0 0 0 4.41 5.3c-3.455 3.212-6.699 4.971-8.903 4.971-.477-.01-.88-.106-1.198-.286Zm25.141-8.077c.498 4.05-.116 7.197-1.547 8.035-.318.19-.732.275-1.22.275-2.193 0-5.447-1.749-8.903-4.94a50.068 50.068 0 0 0 4.378-5.288c2.395-.255 4.664-.647 6.741-1.166.244 1.07.435 2.099.551 3.084Zm4.081-7.07c-.912.393-1.908.743-2.936 1.071a50.913 50.913 0 0 0-2.385-6.455 50.2 50.2 0 0 0 2.353-6.423c1.05.329 2.046.689 2.979 1.081 3.752 1.6 6.179 3.7 6.179 5.363-.01 1.665-2.438 3.774-6.19 5.364Z" fill="#61DAFB"/>
      <path d="M31.99 37.003a4.844 4.844 0 1 0 0-9.688 4.844 4.844 0 0 0 0 9.688Z" fill="#61DAFB"/>
    </symbol>`,
    example: {
      language: 'typescript',
      code: `/* React - tasks-grid.tsx */

export function TasksGrid({ tasks }: TasksGridProps) {
  return (
    <nve-card>

      <nve-card-header>
        <h2 nve-text="heading sm bold">Pending Tasks</h2>
      </nve-card-header>

      <nve-grid container="flat">

        <nve-grid-header>
          <nve-grid-column>ID</nve-grid-column>
          <nve-grid-column>Task</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
        </nve-grid-header>

        {tasks.map(task => (
          <nve-grid-row key={task.id}>
            <nve-grid-cell>{task.id}</nve-grid-cell>
            <nve-grid-cell>{task.name}</nve-grid-cell>
            <nve-grid-cell>
              <nve-badge status={task.status}>
                {task.status}
              </nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
        ))}

      </nve-grid>

    </nve-card>
  );
}`
    }
  },
  {
    id: 'solidjs',
    label: 'SolidJS',
    logo: svg`<symbol id="solidjs" viewBox="0 0 64 64">
      <path opacity=".3" d="M58 18.252S40.667 5.498 27.258 8.441l-.981.327c-1.962.654-3.598 1.635-4.579 2.943l-.654.981-4.906 8.504 8.503 1.635c3.598 2.29 8.177 3.27 12.428 2.29l15.044 2.943L58 18.252Z" fill="url(#a)"/><path opacity=".3" d="m21.698 18.252-1.308.327c-5.56 1.636-7.195 6.869-4.252 11.447 3.27 4.251 10.138 6.54 15.698 4.906l20.277-6.868S34.78 15.309 21.698 18.252Z" fill="url(#b)"/><path d="M48.516 32.97a14.717 14.717 0 0 0-15.698-4.906l-20.277 6.54L6 46.051l36.63 6.214 6.54-11.774c1.308-2.289.98-4.905-.654-7.522Z" fill="url(#c)"/><path d="M41.975 44.416a14.716 14.716 0 0 0-15.698-4.906L6 46.05s17.334 13.083 30.742 9.813l.981-.328c5.56-1.635 7.523-6.868 4.252-11.12Z" fill="url(#d)"/>
      <defs>
        <linearGradient id="a" x1="13.686" y1="7.787" x2="54.403" y2="27.573" gradientUnits="userSpaceOnUse">
          <stop offset=".1" stop-color="#76B3E1"/>
          <stop offset=".3" stop-color="#DCF2FD"/>
          <stop offset="1" stop-color="#76B3E1"/>
        </linearGradient>
        <linearGradient id="b" x1="36.023" y1="17.468" x2="28.893" y2="41.211" gradientUnits="userSpaceOnUse">
          <stop stop-color="#76B3E1"/>
          <stop offset=".5" stop-color="#4377BB"/>
          <stop offset="1" stop-color="#1F3B77"/>
        </linearGradient>
        <linearGradient id="c" x1="10.71" y1="27.802" x2="51.884" y2="55.797" gradientUnits="userSpaceOnUse">
          <stop stop-color="#315AA9"/>
          <stop offset=".5" stop-color="#518AC8"/>
          <stop offset="1" stop-color="#315AA9"/>
        </linearGradient>
        <linearGradient id="d" x1="29.286" y1="31.171" x2="12.672" y2="92.099" gradientUnits="userSpaceOnUse">
          <stop stop-color="#4377BB"/>
          <stop offset=".5" stop-color="#1A336B"/>
          <stop offset="1" stop-color="#1A336B"/>
        </linearGradient>
      </defs>
    </symbol>`,
    example: {
      language: 'typescript',
      code: `/* SolidJS - tasks-grid.tsx */

export const TasksGrid: Component<TasksGridProps> = (props) => {
  return (
    <nve-card>

      <nve-card-header>
        <h2 nve-text="heading sm bold">Pending Tasks</h2>
      </nve-card-header>

      <nve-grid container="flat">

        <nve-grid-header>
          <nve-grid-column>ID</nve-grid-column>
          <nve-grid-column>Task</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
        </nve-grid-header>
  
        {props.tasks.map(task => (
          <nve-grid-row key={task.id}>
            <nve-grid-cell>{task.id}</nve-grid-cell>
            <nve-grid-cell>{task.name}</nve-grid-cell>
            <nve-grid-cell>
              <nve-badge status={task.status}>
                {task.status}
              </nve-badge>
            </nve-grid-cell>
          </nve-grid-row>
        ))}

      </nve-grid>

    </nve-card>
  );
};`
    }
  },
  {
    id: 'vue',
    label: 'Vue',
    logo: svg`<symbol id="vue" viewBox="0 0 64 64">
      <path d="m38.004 10.967-6.005 10.4-6.004-10.4H6L32 56l25.999-45.033H38.004Z" fill="#41B883"/>
      <path d="m38.004 10.967-6.005 10.4-6.004-10.4H16.4L32 37.987l15.599-27.02h-9.595Z" fill="#34495E"/>
    </symbol>`,
    example: {
      language: 'html',
      code: `<!-- Vue - TasksGrid.vue -->

<template>
  <nve-card>

    <nve-card-header>
      <h2 nve-text="heading sm bold">Pending Tasks</h2>
    </nve-card-header>

    <nve-grid container="flat">

      <nve-grid-header>
        <nve-grid-column>ID</nve-grid-column>
        <nve-grid-column>Task</nve-grid-column>
        <nve-grid-column>Status</nve-grid-column>
      </nve-grid-header>

      <nve-grid-row v-for="task in tasks" :key="task.id">
        <nve-grid-cell>{{ task.id }}</nve-grid-cell>
        <nve-grid-cell>{{ task.name }}</nve-grid-cell>
        <nve-grid-cell>
          <nve-badge :status="task.status">
            {{ task.status }}
          </nve-badge>
        </nve-grid-cell>
      </nve-grid-row>

    </nve-grid>

  </nve-card>
</template>`
    }
  }
] as const;

export type FrameworkIdentifier = (typeof FRAMEWORKS)[number]['id'];

export interface FrameworkOption {
  id: FrameworkIdentifier;
  label: string;
  example: {
    language: CodeBlock['language'];
    code: string;
  };
}

export const frameworkOptions: FrameworkOption[] = FRAMEWORKS.map(({ id, label, example }) => ({ id, label, example }));
export const FrameworkIdentifiers: FrameworkIdentifier[] = FRAMEWORKS.map(({ id }) => id);

export const frameworksById = new Map(FRAMEWORKS.map(({ id, logo, example }) => [id, { logo, example }]));

export const frameworkIcons = svg`
  <svg xmlns="http://www.w3.org/2000/svg" style=""display: none">
    ${FRAMEWORKS.map(({ logo }) => logo)}
  </svg>
`;
