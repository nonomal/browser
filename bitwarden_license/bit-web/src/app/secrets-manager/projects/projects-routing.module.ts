import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ProjectPeopleComponent } from "./project/project-people.component";
import { ProjectSecretsComponent } from "./project/project-secrets.component";
import { ProjectServiceAccountsComponent } from "./project/project-service-accounts.component";
import { ProjectComponent } from "./project/project.component";
import { ProjectsComponent } from "./projects/projects.component";

const routes: Routes = [
  {
    path: "",
    component: ProjectsComponent,
  },
  {
    path: ":projectId",
    component: ProjectComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "secrets",
      },
      {
        path: "secrets",
        component: ProjectSecretsComponent,
      },
      {
        path: "people",
        component: ProjectPeopleComponent,
      },
      {
        path: "service-accounts",
        component: ProjectServiceAccountsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
