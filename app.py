from flask import Flask, render_template, request
import duckdb

DATA_PATH = 'data/placementdata.csv'

app = Flask(__name__)

# Connect to DuckDB and read the CSV file into a table
con = duckdb.connect(database=':memory:')
con.execute(f"CREATE TABLE placement_data AS SELECT * FROM read_csv_auto('{DATA_PATH}')")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/data')
def data():
    # Query the pre-loaded table
    df = con.execute("SELECT * FROM placement_data").fetchdf()
    return df.to_html()

@app.route('/update', methods=['POST'])
def update():
    request_data = request.get_json()
    # Extract data from the request
    column = request_data.get('column')
    value = request_data.get('value')

    # Execute a query to update the data
    df = con.execute(f"SELECT * FROM placement_data WHERE {column} = '{value}'").fetchdf()
    return df.to_html()

if __name__ == '__main__':
    app.run(debug=True)