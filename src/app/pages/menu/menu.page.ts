import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  pages = [
    {
      title: 'Lista przepisów',
      url: '/menu/home'
    },
    {
      title: 'Informacje o aplikacji',
      url: '/menu/about'
    },
  ]

  selectedPath = '';

  constructor(private router: Router) {
    this.router.events.subscribe((event: RouterEvent) => {
      if(typeof event.url != ('undefined' || null))
        {
          this.selectedPath = event.url;
        }
    });
  }

  ngOnInit() {
  }

}
