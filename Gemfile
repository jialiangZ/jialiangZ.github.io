source 'https://rubygems.org'

# Jekyll和GitHub Pages
gem 'github-pages', group: :jekyll_plugins

# 性能和SEO插件
group :jekyll_plugins do
  gem 'jekyll-sitemap'
  gem 'jekyll-feed'
  gem 'jekyll-seo-tag'
  gem 'jekyll-include-cache'
  gem 'jekyll-redirect-from'
end

# 开发环境工具
group :development do
  gem 'jekyll-admin'
  gem 'jekyll-compose'
end

# Windows和JRuby支持
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# 性能监控
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]