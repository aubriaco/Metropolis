#!/bin/sh
dotnet ../bin/Release/net10.0/Toolkit.dll translate-reactjs '../../MarketplaceSocial/ClientApp/src/components' '../../MarketplaceSocial/ClientApp/public/lang/dict.json'
cp ../../MarketplaceSocial/ClientApp/public/lang/dict.json social-dict.json.bak
cp dict.json ../../MarketplaceSocial/ClientApp/public/lang/dict.json
rm dict.csv
rm dict.json