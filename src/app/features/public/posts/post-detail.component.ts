import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {PostService} from '../../../core/services/post.service';
import {Post} from '../../../core/models/models';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  post: Post | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPost(slug);
      } else {
        this.loading = false;
      }
    });
  }

  loadPost(slug: string): void {
    this.loading = true;
    this.postService.getPostBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;

        // Update Title & Meta for SEO
        this.titleService.setTitle(`${post.title} | Corporate Portal`);
        this.metaService.updateTag({name: 'description', content: post.summary});

        // Open Graph Meta details (Social SEO)
        this.metaService.updateTag({property: 'og:title', content: post.title});
        this.metaService.updateTag({property: 'og:description', content: post.summary});
        if (post.thumbnail) {
          this.metaService.updateTag({property: 'og:image', content: post.thumbnail});
        }

        // Increment View Count
        if (post.id) {
          this.postService.incrementViews(post.id).subscribe();
        }
      },
      error: (err) => {
        console.error('Không tìm thấy bài viết:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
}
