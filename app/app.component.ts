import {Component} from "@angular/core";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/share";
import {FormBuilder, FormGroup, FormArray} from "@angular/forms";

@Component({
    selector: 'app',
    styles:[`
.ng-invalid{
    color: red;
}
`],
    template: `<form (ngSubmit)="null" [formGroup]="form">
    <h2 [ngClass]="{'ng-invalid': (greaterThan23$ | async)}">{{total$ | async}} should be < 24</h2>
    <div formArrayName="people">
        <fieldset #group *ngFor="let group of people.controls; let i = index" [formGroupName]="i">
            {{people.controls[i].valid}}
            <label for="a"></label><input id="a" type="number" formControlName="a">
            <label for="b"></label><input id="b" type="number" formControlName="b">
        </fieldset>
    </div>
    <button (click)="add()">Add Group</button>
</form>
`
})
export class AppComponent {
    total$;
    greaterThan23$;

    form: FormGroup;
    people: FormArray;

    constructor(private fb: FormBuilder) {
        this.people = fb.array([]);

        this.form = new FormGroup({
                people: this.people
            }
        );

        this.add();
        this.add();
    }

    total(){
        return this.people.controls.reduce((acc, group:FormGroup)=>{
            const a = group.controls['a'].value;
            const b = group.controls['b'].value;

            return acc + parseInt(a) + parseInt(b);
        }, 0);
    }

    totalValidator = ()=> {
        return this.total() < 24
            ? null
            : {valid: false};
    };

    add() {
        const formGroup = this.fb.group({a: 3, b:4});

        this.people.push(formGroup);
        this.people.controls.forEach(group => group.setValidators([this.totalValidator]));
    }

    ngAfterContentInit(){
        this.total$ = this.people
            .valueChanges
            .startWith(0)
            /*
                startWith would cause a sync
                view change in `ngAfterViewInit`
                causing a changeDetection error...
             */
            .map(()=> this.total())
            .distinctUntilChanged();

        this.greaterThan23$ = this.total$
            .map(total => total > 23)
    }

    ngAfterViewInit() {
        this.total$
            .subscribe(total => {
                this.people.controls.forEach(control =>{
                    control.updateValueAndValidity();
                })
            });
    }
}