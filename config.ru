#
# 
# Yea i know it's pathetic to do this through ruby but Heroku is the only place I want to host stuff at this point. 
#
# Yes i don't have a good host for uploading static html files. 
#

use Rack::ContentLength
use Rack::Static, :root => File.dirname(__FILE__) + '/public',  :urls => ["/index.html", '/codemirror', '/javascripts', '/stylesheets']

app = proc do |env|
  [ 302, {'Content-Type' => 'text/plain', 'Location' => '/index.html'}, "Redirecting..." ]
end

run app