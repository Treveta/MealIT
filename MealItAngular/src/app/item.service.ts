import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

// Injectable lets us do cool things like pull json data into other components
@Injectable({
    providedIn: 'root'
})
export class ItemService {

    constructor(
        private http: HttpClient
    ) {}

    getItem() {
        return this.http.get('/assets/items.json');
    }
}