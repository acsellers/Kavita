import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isTemplateSpan } from 'typescript';
import { ScrollService } from '../scroll.service';
import { SearchResult } from '../_models/search-result';
import { AccountService } from '../_services/account.service';
import { ImageService } from '../_services/image.service';
import { LibraryService } from '../_services/library.service';
import { NavService } from '../_services/nav.service';

@Component({
  selector: 'app-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.scss']
})
export class NavHeaderComponent implements OnInit, OnDestroy {

  @ViewChild('search') searchViewRef!: any;

  isLoading = false;
  debounceTime = 300;
  imageStyles = {width: '24px', 'margin-top': '5px'};
  searchResults: SearchResult[] = [];
  searchTerm = '';
  customFilter: (items: SearchResult[], query: string) => SearchResult[] = (items: SearchResult[], query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = items.filter(item => {
      const normalizedSeriesName = item.name.toLowerCase().trim();
      const normalizedOriginalName = item.originalName.toLowerCase().trim();
      const normalizedLocalizedName = item.localizedName.toLowerCase().trim();
      return normalizedSeriesName.indexOf(normalizedQuery) >= 0 || normalizedOriginalName.indexOf(normalizedQuery) >= 0 || normalizedLocalizedName.indexOf(normalizedQuery) >= 0;
    });
    return matches;
  };


  backToTopNeeded = false;
  private readonly onDestroy = new Subject<void>();

  constructor(public accountService: AccountService, private router: Router, public navService: NavService, 
    private libraryService: LibraryService, public imageService: ImageService, @Inject(DOCUMENT) private document: Document, 
    private scrollService: ScrollService) { }

  ngOnInit(): void {
    this.navService.darkMode$.pipe(takeUntil(this.onDestroy)).subscribe(res => {
      if (res) {
        this.document.body.classList.remove('bg-light');
        this.document.body.classList.add('bg-dark');
      } else {
        this.document.body.classList.remove('bg-dark');
        this.document.body.classList.add('bg-light');
      }
    });
  }

  @HostListener("window:scroll", [])
  checkBackToTopNeeded() {
    const offset = this.scrollService.scrollPosition;
    if (offset > 100) {
      this.backToTopNeeded = true;
    } else if (offset < 40) {
        this.backToTopNeeded = false;
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  logout() {
    this.accountService.logout();
    this.navService.hideNavBar();
    this.router.navigateByUrl('/login');
  }

  moveFocus() {
    document.getElementById('content')?.focus();
  }

  onChangeSearch(val: string) {
      this.isLoading = true;
      this.searchTerm = val.trim();
      this.libraryService.search(val).pipe(takeUntil(this.onDestroy)).subscribe(results => {
        this.searchResults = results;
        this.isLoading = false;
      }, err => {
        this.searchResults = [];
        this.isLoading = false;
        this.searchTerm = '';
      });
  }

  clickSearchResult(item: SearchResult) {
    const libraryId = item.libraryId;
    const seriesId = item.seriesId;
    this.searchViewRef.clear();
    this.searchResults = [];
    this.searchTerm = '';
    this.router.navigate(['library', libraryId, 'series', seriesId]);
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      behavior: 'smooth' 
    });
  }

  
}
