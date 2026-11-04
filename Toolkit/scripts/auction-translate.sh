#!/bin/sh
dotnet ../bin/Release/net10.0/Toolkit.dll translate-reactjs '../../MarketplaceAuction/ClientApp/src/components' '../../MarketplaceAuction/ClientApp/public/lang/dict.json'
cp ../../MarketplaceAuction/ClientApp/public/lang/dict.json auction-dict.json.bak
cp dict.json ../../MarketplaceAuction/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json