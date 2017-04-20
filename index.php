<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Find a smartphone</title>
    <link rel="shortcut icon" href="src/img/favicon.ico" type="image/x-icon">
    <link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <link href="src/css/main.css" rel="stylesheet" type="text/css">

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

  </head>
  <body class="landing">
      <h1><i class="fa fa-tags" aria-hidden="true"></i>USED product matcher</h1>

    <div class="col-sm-7 col-sm-offset-4 input-group">
      <button class="btn btn-primary" id="txt_btn" type="button">Search</button>
      <input type="text" id="txt_name" class="form-control" placeholder="Paste the image url...">
    </div>

    <div class="col-md-7 col-md-offset-1 maps">
      <div id="map"></div>
    </div>
    <div class="col-md-3" id="info_box">
      
    </div>

    <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBUg2DfJLopuzyKbLXhjc7V_DqYkpzQjEk" type="text/javascript"></script>
    <script src="dist/bundle.js" type="text/javascript"></script>

    <script type="text/javascript" src="https://sdk.clarifai.com/js/clarifai-latest.js"></script>
  </body>
</html>