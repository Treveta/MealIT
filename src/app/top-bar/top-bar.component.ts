/* eslint-disable require-jsdoc */
import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';

// This component could be where we set up tabs, but it might be more of a process than we think
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit {
  constructor(public auth: AuthService) { }

  ngOnInit() { }
}
