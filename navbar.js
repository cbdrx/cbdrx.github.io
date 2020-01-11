function createNavbar() {
  var navbar = '<nav class="navbar-default navbar">' +
      '<div class="container-fluid">' +
      '<h1>Projects and Live Demos</h1><br>' +
      '<ul class="nav nav-tabs nav-justified">' +
      '<li id="AboutMeTab">' +
      '<a href="index.html"><span class="glyphicon glyphicon-user"></span>About Me</a>' +
      '</li>' +
      '<li id="ProjectsTab">' +
      '<a type="button" id="projectDropdown" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-pencil"></span>Projects Overview<span class="glyphicon glyphicon-triangle-bottom"></span></a>' +
      '<ul class="dropdown-menu">' +
      '<li><a href="vrilog.html">VRilog</a></li>' +
      '<li><a href="opengl.html">OpenGL Flocking</a></li>' +
      '</ul>' +
      '</li>' +
      '<li id="LiveDemoTab">' +
      '<a type="button" id="liveDemoDropdown" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon glyphicon-console"></span>Live Javascript Demos<span class="glyphicon glyphicon-triangle-bottom"></span></a>' +
      '<ul class="dropdown-menu">' +
      '<li><a href="cellular.html">Cellular Automata </a></li>' +
      '<li><a href="sorting.html">Sorting Algorithms </a></li>' +
      '</ul>' +
      '</li>' +
      '<li id="GithubTab">' +
      '<a href="https://github.com/cbdrx/"><span class="glyphicon glyphicon-equalizer" style="transform:rotate(90deg);"></span> Github </a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</nav>';

  return navbar;
}

function setActiveTab(page) {
  switch (page) {
    case 'AboutMe': {
      $('#AboutMeTab').addClass('active');
      break;
    }
    case 'Projects': {
      $('#ProjectsTab').addClass('active');
      break;
    }
    case 'LiveDemo': {
      $('#LiveDemoTab').addClass('active');
      break;
    }
    default: { break; }
  }
}