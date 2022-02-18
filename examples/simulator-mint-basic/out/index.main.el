#lang ll
parts {
  "Alice" = interact {
    didTransfer = IT_Fun [Bool,UInt] Null,
    getParams = IT_Fun [] Object({"amt": UInt, "metadata": Bytes(32), "name": Bytes(32), "supply": UInt, "symbol": Bytes(8), "url": Bytes(96)}),
    showToken = IT_UDFun Null},
  "Bob" = interact {
    didTransfer = IT_Fun [Bool,UInt] Null,
    showToken = IT_UDFun Null}};

// maps
{
  }
// initialization

{
  }
{
  }
{
  }
{
  }
only(Left "Alice") {
  const v225* = protect<Object({"amt": UInt, "metadata": Bytes(32), "name": Bytes(32), "supply": UInt, "symbol": Bytes(8), "url": Bytes(96)})>("Alice".interact.getParams());
  const v226! = v225.name;
  const v227! = v225.symbol;
  const v228! = v225.url;
  const v229! = v225.metadata;
  const v230* = v225.supply;
  const v231* = v225.amt;
  const v232* = 4 * v231;
  const v233! = v232 <= v230;
  claim(CT_Assume False)(v233, Nothing);
  const v235! = v232 <= UInt.max;
  claim(CT_Assume False)(v235, Nothing);
   };
publish(@0)
  .case("Alice").send({
    isClass = False,
    msg = [v226, v227, v228, v229, v230, v231],
    pay = [0, ],
    when = true})
  .recv({
    didSend = v43,
    from = v236,
    msg = [v237, v238, v239, v240, v241, v242],
    secs = v244,
    time = v243}){
    checkPay(0, Nothing);
    const v246* = 4 * amt/242;
    const v247! = v246 <= supply/241;
    claim(CT_Require)(v247, Nothing);
    const v249! = v246 <= UInt.max;
    claim(CT_Require)(v249, Nothing);
    const v250* = new Token({
      decimals = null,
      metadata = metadata/240,
      name = name/237,
      supply = supply/241,
      sym = symbol/238,
      url = url/239});
    const v251* = emitLog(internal)(v250 );
    only(Left "Alice") {
      const v253! = {
        metadata = metadata/240,
        name = name/237,
        supply = supply/241,
        symbol = symbol/238,
        url = url/239};
      protect<Null>("Alice".interact.showToken(v251, v253 ));
       };
    commit();
    publish(@thisConsensusTime/243)
      .case("Bob").send({
        isClass = False,
        msg = [],
        pay = [0, ],
        when = true})
      .recv({
        didSend = v59,
        from = v254,
        msg = [],
        secs = v256,
        time = v255}){
        checkPay(0, Nothing);
        only(Left "Bob") {
          const v259! = {
            metadata = metadata/240,
            name = name/237,
            supply = supply/241,
            symbol = symbol/238,
            url = url/239};
          protect<Null>("Bob".interact.showToken(v251, v259 ));
           };
        commit();
        publish(@thisConsensusTime/255)
          .case("Bob").send({
            isClass = False,
            msg = [],
            pay = [0, ],
            when = true})
          .recv({
            didSend = v70,
            from = v260,
            msg = [],
            secs = v262,
            time = v261}){
            checkPay(0, Nothing);
            const v264! = v254 == v260;
            claim(CT_Require)(v264, Just "sender correct");
            const v265* = 2 * amt/242;
            transfer.(v265, Just v251).to(v254);
            only(Left "Bob") {
              protect<Null>("Bob".interact.didTransfer(true, amt/242 ));
               };
            commit();
            publish(@thisConsensusTime/261)
              .case("Alice").send({
                isClass = False,
                msg = [],
                pay = [0, ],
                when = true})
              .recv({
                didSend = v86,
                from = v272,
                msg = [],
                secs = v274,
                time = v273}){
                checkPay(0, Nothing);
                const v276! = v236 == v272;
                claim(CT_Require)(v276, Just "sender correct");
                transfer.(v265, Just v251).to(v236);
                only(Left "Alice") {
                  protect<Null>("Alice".interact.didTransfer(true, amt/242 ));
                   };
                commit();
                publish(@thisConsensusTime/273)
                  .case("Alice").send({
                    isClass = False,
                    msg = [],
                    pay = [0, (v265, v251 ) ],
                    when = true})
                  .recv({
                    didSend = v106,
                    from = v285,
                    msg = [],
                    secs = v287,
                    time = v286}){
                    checkPay(0, Nothing);
                    checkPay(v265, Just v251);
                    const v292! = v236 == v285;
                    claim(CT_Require)(v292, Just "sender correct");
                    commit();
                    publish(@thisConsensusTime/286)
                      .case("Bob").send({
                        isClass = False,
                        msg = [],
                        pay = [0, (v265, v251 ) ],
                        when = true})
                      .recv({
                        didSend = v116,
                        from = v294,
                        msg = [],
                        secs = v296,
                        time = v295}){
                        checkPay(0, Nothing);
                        checkPay(v265, Just v251);
                        const v301! = v254 == v294;
                        claim(CT_Require)(v301, Just "sender correct");
                        Token(v251).burn(supply/241);
                        Token(v251).destroy();
                        const v312! = "                                                                                                ";
                        const v313! = "                                ";
                        const v314* = new Token({
                          decimals = null,
                          metadata = v313,
                          name = name/237,
                          supply = UInt.max,
                          sym = symbol/238,
                          url = v312});
                        const v315* = emitLog(internal)(v314 );
                        only(Left "Alice") {
                          const v317! = {
                            name = name/237,
                            symbol = symbol/238};
                          protect<Null>("Alice".interact.showToken(v315, v317 ));
                           };
                        only(Left "Bob") {
                          const v319! = {
                            name = name/237,
                            symbol = symbol/238};
                          protect<Null>("Bob".interact.showToken(v315, v319 ));
                           };
                        commit();
                        publish(@thisConsensusTime/295)
                          .case("Bob").send({
                            isClass = False,
                            msg = [],
                            pay = [0, ],
                            when = true})
                          .recv({
                            didSend = v146,
                            from = v320,
                            msg = [],
                            secs = v322,
                            time = v321}){
                            checkPay(0, Nothing);
                            const v324! = v254 == v320;
                            claim(CT_Require)(v324, Just "sender correct");
                            const v329* = UInt.max - v265;
                            transfer.(v265, Just v315).to(v254);
                            only(Left "Bob") {
                              protect<Null>("Bob".interact.didTransfer(true, amt/242 ));
                               };
                            commit();
                            publish(@thisConsensusTime/321)
                              .case("Alice").send({
                                isClass = False,
                                msg = [],
                                pay = [0, ],
                                when = true})
                              .recv({
                                didSend = v162,
                                from = v332,
                                msg = [],
                                secs = v334,
                                time = v333}){
                                checkPay(0, Nothing);
                                const v336! = v236 == v332;
                                claim(CT_Require)(v336, Just "sender correct");
                                const v341* = v329 - v265;
                                transfer.(v265, Just v315).to(v236);
                                only(Left "Alice") {
                                  protect<Null>("Alice".interact.didTransfer(true, amt/242 ));
                                   };
                                const v348! = v341 - v341;
                                Token(v315).burn(v341);
                                commit();
                                publish(@thisConsensusTime/333)
                                  .case("Alice").send({
                                    isClass = False,
                                    msg = [],
                                    pay = [0, (v265, v315 ) ],
                                    when = true})
                                  .recv({
                                    didSend = v189,
                                    from = v352,
                                    msg = [],
                                    secs = v354,
                                    time = v353}){
                                    checkPay(0, Nothing);
                                    const v358! = v348 + v265;
                                    checkPay(v265, Just v315);
                                    const v359! = v236 == v352;
                                    claim(CT_Require)(v359, Just "sender correct");
                                    commit();
                                    publish(@thisConsensusTime/353)
                                      .case("Bob").send({
                                        isClass = False,
                                        msg = [],
                                        pay = [0, (v265, v315 ) ],
                                        when = true})
                                      .recv({
                                        didSend = v199,
                                        from = v361,
                                        msg = [],
                                        secs = v363,
                                        time = v362}){
                                        checkPay(0, Nothing);
                                        const v367* = v358 + v265;
                                        checkPay(v265, Just v315);
                                        const v368! = v254 == v361;
                                        claim(CT_Require)(v368, Just "sender correct");
                                        Token(v315).burn(v367);
                                        Token(v315).destroy();
                                        commit();
                                        exit(); }
                                       }
                                   }
                               }
                           }
                       }
                   }
               }
           }
       }
  