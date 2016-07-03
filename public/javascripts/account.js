$(function() {
  var fileList = $("#fileList");  //gets the fileList

  var queryType = $("#queryType");  //gets the querytype from jade
  var box  = $("#box");  //get the box from jade
  box.hide(); //hides the box


//chart variables
  var chart = $("#myChart").get(0).getContext("2d");
  var myBarChart;


  var stats;

//download function
  function downloadFile(i) {
      function saveDownloadedFile(fileContents) {
          console.log("Trying to save file");
          saveAs(new Blob([fileContents],
                          {type: "text/plain;charset=utf-8"}),
                 stats[i].name);
      }
      
      return function() {
          $.post("/downloadFile", {downloadFile: stats[i].name},
                 saveDownloadedFile);
      }
  }

  function analyzeSelected(theLogs) {

    var date = "";
    var values = {};
    var labels = [];
    var numberOfLabels = [];

    for(i=0;i<theLogs.length;i++)
    {
      date = theLogs[i].date;
      if(values[date]) {
        values[date] += 1;
      }
      else
        values[date] = 1;
    }

    Object.keys(values).forEach(function(key) {
      labels.push(key);
      numberOfLabels.push(values[key]);
    });

    var data = {
          labels: labels,
          datasets: [
                    {
            label: "Feb 16",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: numberOfLabels
    }]};
    return data;
}

  function entriesToLines(theLogs) {
    var logArr = [];

    for(var i=0;i<theLogs.length;i++)
    {
      var str = theLogs[i].date + " " + theLogs[i].time + " " +
            theLogs[i].host + " " + theLogs[i].service + " " +
            theLogs[i].message;
      logArr.push(str);
    }
    return logArr.join('\n');
  }

  $("#button").click(function()
    { 
      box.hide();

      if(myBarChart)
      {
        myBarChart.destroy();
      }

      var message = $("input:text[name=message]").val();
      var service = $("input:text[name=service]").val();
      var file    = $("input:text[name=file]").val();
      var month   = $("input:text[name=month]").val();
      var day     = $("input:text[name=day]").val();

      var queryObject = { message : message,
                          service : service,
                          file    : file,
                          month   : month,
                          day     : day};

      $.post("/doQuery", queryObject, function(query) 
      {
        var modifiedQuery = entriesToLines(query);
        
        console.log(query[0]);



        if(queryType.val() === 'show')
        { 
          box.text(modifiedQuery);
          box.show();
        }
       else if(queryType.val() === 'visualize')
       {
          myBarChart = new Chart(chart).Bar(analyzeSelected(query), {});
       }
       else if(queryType.val() === 'download')
       {
          saveAs(new Blob([modifiedQuery],
                          {type: "text/plain;charset=utf-8"}),
                 "queryResults");
      }
      })
    });


  
  function doUpdateFileList (returnedStats) {
      var i;
      stats = returnedStats;
      fileList.empty();
      for (i=0; i<stats.length; i++) {
          fileList.append('<li> <a id="file' + i + '" href="#">' +
                          stats[i].name +
                          "</a> (" + stats[i].size + " bytes)");
          $("#file" + i).click(downloadFile(i));
      }
  }

  
  function updateFileList () {
      $.getJSON("/getFileStats", doUpdateFileList);
  }

  updateFileList();
  
  $("#fileuploader").uploadFile({
      url:"/uploadLog",
      fileName:"theFile",
      dragDrop: false,
      uploadStr: "Upload Files",
      afterUploadAll: updateFileList
  });    
});
