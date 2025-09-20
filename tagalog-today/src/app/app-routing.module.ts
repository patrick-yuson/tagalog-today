import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WordDetailComponent } from './components/word-detail/word-detail.component';


const routes: Routes = [
  // { path: '', redirectTo: '/words', pathMatch: 'full' },
  { path: 'word/:id', component: WordDetailComponent },
  { path: 'word-detail', component: WordDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
