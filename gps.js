var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var events = require('events');
 
function GPS() {
  events.EventEmitter.call(this);
 
  this.reads = 0
  this.collected = []
  this.obj = {}
  var me = this;
  
  var serialPort = new SerialPort("/dev/cu.SLAB_USBtoUART", { 
    baudrate: 4800,
    parser: serialport.parsers.readline("\n") 
  });
  
  serialPort.on("open", function () {
    serialPort.on('data', function(d){
      me.parseGPSData(d)
    });
  });

  this.latLngToDecimal = function(coord){
    if (coord == undefined) return 
    negative = (parseInt(coord) < 0)
    decimal = null
    if (match = coord.match(/^-?([0-9]*?)([0-9]{2,2}\.[0-9]*)$/)){
      deg = parseInt(match[1])
      min = parseFloat(match[2])

      decimal = deg + (min / 60)
      if (negative){
        decimal *= -1
      }
    }
  
    return decimal
  }

  this.parseGPSData = function(data){
    var that = this;
    line = data.split(',')
  
    if (line[0].slice(0,1) != "$") {
      return
    }

    type = line[0].slice(3,6)

    if (type == null) {
      return
    }

    line.shift()

    switch (type) {
    case "GGA":
      this.obj.time               = line.shift()
      this.obj.latitude           = this.latLngToDecimal(line.shift())
      this.obj.lat_ref            = line.shift()
      this.obj.longitude          = this.latLngToDecimal(line.shift())
      this.obj.long_ref           = line.shift()
      this.obj.quality            = line.shift()
      this.obj.num_sat            = parseInt(line.shift())
      this.obj.hdop               = line.shift()
      this.obj.altitude           = line.shift()
      this.obj.alt_unit           = line.shift()
      this.obj.height_geoid       = line.shift()
      this.obj.height_geoid_unit  = line.shift()
      this.obj.last_dgps          = line.shift()
      this.obj.dgps               = line.shift()
      break;
    case "RMC":
      this.obj.time          = line.shift()
      this.obj.validity      = line.shift()
      this.obj.latitude      = this.latLngToDecimal(line.shift())
      this.obj.lat_ref       = line.shift()
      this.obj.longitude     = this.latLngToDecimal(line.shift())
      this.obj.long_ref      = line.shift()
      this.obj.speed         = line.shift()
      this.obj.course        = line.shift()
      this.obj.date          = line.shift()
      this.obj.variation     = line.shift()
      this.obj.var_direction = line.shift()
      break;
    case "GLL":
      this.obj.latitude   = this.latLngToDecimal(line.shift())
      this.obj.lat_ref    = line.shift()
      this.obj.longitude  = this.latLngToDecimal(line.shift())
      this.obj.long_ref    = line.shift()
      this.obj.time        = line.shift()
      break;
    case "RMA":
    
      line.shift()
      this.obj.latitude    = this.latLngToDecimal(line.shift())
      this.obj.lat_ref    = line.shift()
      this.obj.longitude  = this.latLngToDecimal(line.shift())
      this.obj.long_ref    = line.shift()
      line.shift()
      line.shift()
      this.obj.speed      = line.shift()
      this.obj.course      = line.shift()
      this.obj.variation  = line.shift()
      this.obj.var_direction  = line.shift()
      break;
    case "GSA":
    
      this.obj.mode            = line.shift()
      this.obj.mode_dimension  = line.shift()
    
      if(this.obj.satellites == undefined) { this.obj.satellites = [] }
    
      for(i=0; i<=11; i++) {
        (function(i) {
          id = line.shift()
          if (id == ''){
            that.obj.satellites[i] = {}
          } else {
            if(that.obj.satellites[i] == undefined) { that.obj.satellites[i] = {} }
            that.obj.satellites[i].id = id
          }
        })(i);
      }
    
      this.obj.pdop      = line.shift()
      this.obj.hdop      = line.shift()
      this.obj.vdop      = line.shift()
    
      break;
    case "GSV":
      this.obj.msg_count  = line.shift()
      this.obj.msg_num    = line.shift()
      this.obj.num_sat    = parseInt(line.shift())

      if(this.obj.satellites == undefined) { this.obj.satellites = [] }

      for(i=0; i<=3; i++) {
        (function(i) {
          if(that.obj.satellites[i] == undefined) { that.obj.satellites[i] = {} }

          that.obj.satellites[i].elevation  = line.shift()
          that.obj.satellites[i].azimuth    = line.shift()
          that.obj.satellites[i].snr        = line.shift()
        })(i);
      }
    
      break;
    case "HDT":
    
      this.obj.heading  = line.shift()
      break;
    case "ZDA":
    
      this.obj.time  = line.shift()
    
      day    = line.shift()
      month  = line.shift()
      year  = line.shift()
      if (year.length > 2){
        year = [2, 2]
      }
      this.obj.date = day + month + year
    
      this.obj.local_hour_offset    = line.shift()
      this.obj.local_minute_offset  = line.shift()
      break;
  
    default:
    
    }
  
    Object.keys(this.obj).map(function (key) {
        val = that.obj[key]
        if(val === ""){
          delete that.obj[key]
        }
    });
  
    this.reads ++
    this.collected.push(type)
    this.collected = this.collected.filter(function(v,i,s){
      return that.onlyUnique(v,i,s)
    });
    if (this.reads > 5 && this.collected.indexOf('GGA') > -1 && this.collected.indexOf('RMC') > -1){
      this.emit('location', this.obj)
      this.reads = 0
      this.collected = []
      this.obj = {}
    }
  }
  

  this.onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index;
  }
}
 
GPS.prototype.__proto__ = events.EventEmitter.prototype;
 
module.exports = GPS