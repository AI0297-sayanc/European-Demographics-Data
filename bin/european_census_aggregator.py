
'''
Introduction:
-------------
This Python file provides a function to calculate census values based on user-selected coordinates and a specified radius within Europe. 
Using census documents from the MongoDB - European demographics's census collection,
the function aggregates variables within the given radius, resulting in a dictionary
that includes census variables and their corresponding values for the selected market area.

Last updated on: 12-Mar-2024 (v1.0)


Instructions:
-------------
To use this code, follow the steps below:

1. Install the required dependencies:
   - numpy: `pip install numpy`
   - argparse: `pip install argparse`

2. Ensure that you have the necessary input files:
    - 'file1.txt': Path to the file containing the list of census documents within the radius.

3. Run the code using the command-line interface.

    $ python european_census_aggregator.py <file1.txt>
'''


import sys
import argparse

import json
import numpy as np
from collections import defaultdict



# Compute the weighted average given two arrays and a total.
def weighted_average(arr1, arr2, total):
    """
    Args:
        arr1 (numpy.ndarray): First array.
        arr2 (numpy.ndarray): Second array.
        total (float): Total value.
    """
    if np.isnan(total) or total==0:
        return None
    total_arr = arr1 * arr2
    avg_value = np.nansum(total_arr) / total
    if np.isnan(avg_value):
        return None
    return round(avg_value, 3)


# Convert None values in an array to NaN.
def convert_none_to_nan(arr):
    return np.where(np.equal(arr, None), np.nan, arr)

# Convert a value to an integer, handling None and non-positive values.
def convert_to_int_or_none(value):
    if value is None or np.isnan(value) or value<=0:
        return None
    return int(value)


# Extract and process a specific attribute from a collection list.
def process_attribute(collection_list, census_code):
    """
    Args:
        collection_list (list): List of dictionaries with census attributes.
        census_code (str): Code of the census attribute.
    """
    arr = [i[census_code] for i in collection_list]
    arr = convert_none_to_nan(arr)
    arr = arr.astype(float)
    return arr


# Process census data and calculate demographics for different country-level combinations in EU.
def census_aggregator(census_collection_lst):
    """
    Args:
     census_collection_lst (list): List of census collection data.

     Returns:
     - dict: Demographic data for each country-level combination.
    """
        
    
    # Extract distinct country-level combinations
    cntr_lvl_combinations = {(item['countryCode'], item['levelCode']) for item in census_collection_lst}
    cntr_lvl_combinations = list(cntr_lvl_combinations)


    result_list = []
    
    for cntr_lvl in cntr_lvl_combinations:
        country_code, level_code = cntr_lvl
        iter_collection = [i['censusAttributes'] for i in census_collection_lst if i['countryCode']==country_code and i['levelCode']==level_code]
    
        # Calculate demographics
        
        # 1) Total population:
        total_population_arr = process_attribute(iter_collection, 'EU_E001')
        total_population = np.nansum(total_population_arr)
    
        # 2) Total Households:
        total_households_arr = process_attribute(iter_collection, 'EU_E002')
        total_households = np.nansum(total_households_arr)
        
        # 3) Owned Households - Percentage: (EU_E006)
        owned_households_perc_arr = process_attribute(iter_collection, 'EU_E006') 
        owned_households_perc = np.nansum(owned_households_perc_arr)
        
        # owned households array & Total owned households:
        owned_households_arr = owned_households_perc_arr * total_households_arr
        total_owned_hh = owned_households_perc * total_households
        
        
        # 4) Rented households percentage- 
        rental_households_perc_arr = 1 - owned_households_perc_arr
        rental_households_perc = np.nansum(rental_households_perc_arr)
        
        # rented households array & Total rented households:
        rental_households_arr = rental_households_perc_arr * total_households_arr
        total_rented_hh = rental_households_perc * total_households
    
    
        # 5) Median Household Income:
        mhi_arr = process_attribute(iter_collection, 'EU_E003')
        
        per_capita_income_dict = {'arr1': total_population_arr, 'arr2': mhi_arr, 'total': total_population}
        avg_hh_income_dict = {'arr1': total_households_arr, 'arr2': mhi_arr, 'total': total_households}
        
        # Czechia - lvl1: MHI in CZK
        # Sweden - lvl2 & lvl3: MHI in SEK
        # Norway - lvl2: MHI in NOR
        # England - lvl2: MHI in GBP
        # Scotland - lvl2 & lvl3: MHI is in GBP
        # Wales - lvl2: MHI in GBP
        
        # Define a dictionary to map MHI conditions:
        mhi_mapping = {
            ('BE', 3): per_capita_income_dict,
            ('CZ', 1): per_capita_income_dict, # warning: only because - HH data not available. 
            ('FI', 3): per_capita_income_dict, # Median income per capita.
            ('DE', 1): per_capita_income_dict, # Avg income per capita.
            ('DE', 2): per_capita_income_dict, # Avg income per capita.
        }
        
        # Get the appropriate data based on country_code and level_code
        mhi_data = mhi_mapping.get((country_code, level_code), avg_hh_income_dict)
        mhi = weighted_average(**mhi_data)
    
        # 6) Average Property Value:
        mpv_arr = process_attribute(iter_collection, 'EU_E004')
        mpv = weighted_average(owned_households_arr, mpv_arr, total_owned_hh)
    
        # NO: lvl2 & lvl3 - MPV is avg price per sq.meter (NOR)
        # England - lvl1 & lvl2: MPV in GBP
        # Scotland - lvl1, lvl2 & lvl3: MPV is in GBP
        # wales - lvl1 & lvl2: MPV in GBP
        # Northern Ireland - lvl2, lvl3: MPV in GBP
        
        # 7) Average Rental Value:
        mrv_arr = process_attribute(iter_collection, 'EU_E005')
        mrv = weighted_average(rental_households_arr, mrv_arr, total_rented_hh)
        
        # Finland - lvl3 : MRV is avg rent per sq.meter (EUR)
        # England - lvl2: MRV in GBP
        # Ireland - lvl1: avg weekly rental value.
        
    
        # Cleaning the output data:
        total_households = None if total_households==0 and total_population>0 else total_households
    
        if total_households is not None:
            owned_households_perc = None if total_households>=0 and owned_households_perc==0 else owned_households_perc
        else:
            owned_households_perc = None

    
        # Store demographic data
        iter_data = {}
        iter_data['countryCode'] = country_code
        iter_data['levelCode'] = level_code
        iter_data['censusAttributes'] = {
            'EU_E001': convert_to_int_or_none(total_population), 
            'EU_E002': convert_to_int_or_none(total_households),
            'EU_E003': convert_to_int_or_none(mhi),
            'EU_E004': convert_to_int_or_none(mpv),
            'EU_E005': convert_to_int_or_none(mrv),
            'EU_E006': convert_to_int_or_none(owned_households_perc)
        }

        result_list.append(iter_data)

    return result_list



## For Direct Execution as a script:
if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="EU Census Aggregator Function")
    parser.add_argument("file1", type=str, help="Path to the file containing Census documents within the radius")

    args = parser.parse_args()
    
    # Read data from text files
    with open(args.file1, 'r') as file:
        # file1_data = eval(file.read())
        file1_data = json.loads(file.read()) # Note: if this line fails, please use the above line.
        
    # Pass the data to the function
    output = census_aggregator(file1_data)
    
    print(json.dumps(output))