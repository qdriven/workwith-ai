energyplus -w \
./data/USA_AK_Fairbanks.Intl.AP.702610_TMY3.epw \
-r ./data/ASHRAE901_OfficeLarge_STD2019_Albuquerque.idf \
-d ./train-data/ASHRAE901_OfficeLarge_STD2019_Albuquerque

# energyplus -w \
# ./data/USA_AK_Fairbanks.Intl.AP.702610_TMY3.epw \
# -r ./data/ASHRAE901_OfficeLarge_STD2019_Albuquerque.idf

# energyplus -w ./data/USA_AK_Fairbanks.Intl.AP.702610_TMY3.epw \
#            -r ./data/ASHRAE901_OfficeLarge_STD2019_Albuquerque.idf \
#            -p eplusout \
#            -s C \
#            -x