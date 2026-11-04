#!/bin/sh
dotnet ../bin/Release/net10.0/Toolkit.dll translate-reactjs '../../Marketplace/react-src/src/components' '../../Marketplace/react-src/public/lang/dict.json'
cp ../../Marketplace/react-src/public/lang/dict.json marketplace-dict.json.bak
cp dict.json ../../Marketplace/react-src/public/lang/dict.json
rm dict.csv
rm dict.json
rm marketplace-dict.json.bak