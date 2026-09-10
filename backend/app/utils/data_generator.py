import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_sample_sales_csv(output_path: str = "data/sample_sales.csv", num_days: int = 1095) -> str:
    """
    Generates a realistic 3-year daily retail sales dataset (e.g., 2021-01-01 to 2023-12-31).
    Dataset includes trend, day-of-week seasonality, annual seasonality, and realistic noise.
    Includes additional realistic fields like Category, Sub_Category, Region, Quantity, Profit.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    np.random.seed(42)
    start_date = datetime(2021, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(num_days)]
    
    categories = ["Furniture", "Office Supplies", "Technology"]
    sub_categories = {
        "Furniture": ["Chairs", "Tables", "Bookcases", "Furnishings"],
        "Office Supplies": ["Paper", "Binders", "Storage", "Art", "Appliances"],
        "Technology": ["Phones", "Accessories", "Copiers", "Machines"]
    }
    regions = ["East", "West", "Central", "South"]
    
    records = []
    order_id_counter = 10001
    
    for i, current_date in enumerate(dates):
        # Base demand trend (linear growth over time)
        trend = 500 + (i * 0.4)
        
        # Day of week seasonality (Weekend spikes, Monday dip)
        dow = current_date.weekday()
        dow_factor = 1.0
        if dow == 4: # Friday
            dow_factor = 1.15
        elif dow == 5: # Saturday
            dow_factor = 1.30
        elif dow == 6: # Sunday
            dow_factor = 1.25
        elif dow == 0: # Monday
            dow_factor = 0.85
            
        # Annual seasonality (High in Q4 / November-December holidays, Q1 slight drop)
        day_of_year = current_date.timetuple().tm_yday
        annual_factor = 1.0 + 0.3 * np.sin(2 * np.pi * (day_of_year - 60) / 365.25)
        if current_date.month in [11, 12]:
            annual_factor += 0.25 # Holiday season boost
            
        # Noise
        noise = np.random.normal(1.0, 0.12)
        
        # Total daily sales baseline
        daily_sales = max(50.0, trend * dow_factor * annual_factor * noise)
        
        # Generate 1 to 4 individual order line items per day
        num_transactions = np.random.randint(1, 4)
        split_sales = np.random.dirichlet(np.ones(num_transactions)) * daily_sales
        
        for sale_amount in split_sales:
            cat = np.random.choice(categories)
            sub_cat = np.random.choice(sub_categories[cat])
            region = np.random.choice(regions)
            quantity = max(1, int(sale_amount / np.random.uniform(20, 150)))
            discount = float(np.random.choice([0.0, 0.1, 0.15, 0.2]))
            profit = round(sale_amount * np.random.uniform(0.08, 0.28), 2)
            
            records.append({
                "Order_ID": f"CA-{current_date.year}-{order_id_counter}",
                "Date": current_date.strftime("%Y-%m-%d"),
                "Sales": round(float(sale_amount), 2),
                "Category": cat,
                "Sub_Category": sub_cat,
                "Region": region,
                "Quantity": quantity,
                "Discount": discount,
                "Profit": profit
            })
            order_id_counter += 1
            
    df = pd.DataFrame(records)
    
    # Introduce a couple of realistic empty/dirty records to test cleaner resilience without harming data size
    # E.g., duplicate 2 rows and add 1 null in Category (not Sales/Date)
    df = pd.concat([df, df.iloc[[10, 50]]], ignore_index=True)
    df.to_csv(output_path, index=False)
    print(f"Sample sales CSV generated with {len(df)} rows at {output_path}")
    return output_path

if __name__ == "__main__":
    generate_sample_sales_csv()
