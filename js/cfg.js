FR = window.FR || {};
FR.Cfg = (function() {
    var cfg = {
        numguesses: 5
        , ranks: [{
			minscore: 0
			, maxscore: 10
            , name: "Explorador Novato"
        }
        , {
			minscore: 10
			, maxscore: 35
            , name: "Aprendiz de Explorador"
        }
        , {
			minscore: 35
			, maxscore: 70
            , name: "Explorador Veterano"
        }
        , {
			minscore: 70
			, maxscore: 95
            , name: "Maestro Explorador"
        }
        , {
			minscore: 95
			, maxscore: 100
            , name: "Explorador Legendario"
        }]
        , maxdistance: 550
        , mindistance: 50
        , maxscore: 1000
        , locations: {
            "PAMPLONA": {
                codigoINE: "31201"
                , name: "Pamplona"
                , availablePhotos: 953
                , poi: {photos:[{"height":240,"latitude":42.818306,"longitude":-1.64384,"owner_id":3100109,"owner_name":"Mircea_RAICU","owner_url":"http://www.panoramio.com/user/3100109","photo_file_url":"http://mw2.google.com/mw-panoramio/photos/medium/91125329.jpg","photo_id":91125329,"photo_title":"Ayuntamiento de Pamplona","photo_url":"http://www.panoramio.com/photo/91125329","place_id":"cc19a603fe7372fae28c558f495a1b43822d22d4","upload_date":"31 May 2013","width":162}, {"height":160,"latitude":42.816489,"longitude":-1.642513,"owner_id":6702390,"owner_name":"Ángel González Quesada","owner_url":"http://www.panoramio.com/user/6702390","photo_file_url":"http://mw2.google.com/mw-panoramio/photos/medium/73233019.jpg","photo_id":73233019,"photo_title":"Plaza del Castillo Pamplona – Iruña","photo_url":"http://www.panoramio.com/photo/73233019","upload_date":"04 June 2012","width":240}, {"height":237,"latitude":42.822319,"longitude":-1.654623,"owner_id":1132712,"owner_name":"TATXU","owner_url":"http://www.panoramio.com/user/1132712","photo_file_url":"http://mw2.google.com/mw-panoramio/photos/medium/6172354.jpg","photo_id":6172354,"photo_title":"puente luminoso rotxapea","photo_url":"http://www.panoramio.com/photo/6172354","upload_date":"27 November 2007","width":240}, {"height":166,"latitude":42.808621,"longitude":-1.662524,"owner_id":54496,"owner_name":"Malko - VIEWS, NO THANKS","owner_url":"http://www.panoramio.com/user/54496","photo_file_url":"http://mw2.google.com/mw-panoramio/photos/medium/78722449.jpg","photo_id":78722449,"photo_title":"Lago Yamaguchi IR","photo_url":"http://www.panoramio.com/photo/78722449","upload_date":"11 September 2012","width":240}, {"height":180,"latitude":42.801289,"longitude":-1.637607,"owner_id":588519,"owner_name":"estudiooberon.com","owner_url":"http://www.panoramio.com/user/588519","photo_file_url":"http://mw2.google.com/mw-panoramio/photos/medium/2954078.jpg","photo_id":2954078,"photo_title":"Pamplona - Universidad Pública de Navarra","photo_url":"http://www.panoramio.com/photo/2954078","upload_date":"26 June 2007","width":240}]}
                , ranknames: ["GUIRI BEODO", "TURISTA ENTENDIDILLO", "PAMPLONICA COMUN", "HABITUAL DE LA COMARCA", "PTV (Pamplona Toda Vida)"]
            }
            , "BARCELONA": {
                codigoINE: "08019"
                , name: "Barcelona"
                , availablePhotos: 4964          
            }
            , "SALAMANCA": {
                codigoINE: "37274"
                , name: "Salamanca"
                , availablePhotos: 1015
            }
        }
    };
	return cfg;
})();