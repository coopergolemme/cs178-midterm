from flask import Flask, render_template, request, jsonify
import duckdb

DATA_PATH = 'data/placementdata.csv'

app = Flask(__name__)


columns = ["CGPA","Internships","Projects","Workshops/Certifications",
           "AptitudeTestScore","SoftSkillsRating","ExtracurricularActivities",
           "PlacementTraining","SSC_Marks","HSC_Marks","PlacementStatus"]

facet = ["ExtracurricularActivities", "PlacementTraining", "PlacementStatus"]

continuous = ["Internships", "Projects", "AptitudeTestScore",
              "SoftSkillsRating", "SSC_Marks", "HSC_Marks"]

dropdown_options = continuous + ["Workshops/Certifications", "CGPA"]

discrete_columns = ["ExtracurricularActivities", "PlacementTraining"]
discrete_options = ["Yes", "No"]



# Connect to DuckDB and read the CSV file into a table
con = duckdb.connect(database=':memory:')

con.execute(f"CREATE TABLE placement_data AS SELECT * FROM read_csv_auto('{DATA_PATH}')")   

@app.route('/')
def index():
    continuous_queries = [f'MIN({x}), MAX({x})' for x in continuous]
    continuous_queries = ', '.join(continuous_queries)

    scatter_ranges_query = f'SELECT MIN(AptitudeTestScore), MAX(AptitudeTestScore), MIN(CGPA), MAX(CGPA) FROM placement_data'
    scatter_ranges_results = con.sql(scatter_ranges_query).df()
    scatter_ranges = scatter_ranges_results.iloc[0].tolist()

    filter_ranges_query = 'SELECT ' + continuous_queries + ' FROM placement_data' 

    
    filter_ranges_results = con.sql(filter_ranges_query).df()
    fr_list = filter_ranges_results.iloc[0].tolist()
    filter_ranges = {"Internships": [fr_list[0], fr_list[1]],
                     "Projects": [fr_list[2], fr_list[3]],
                     "AptitudeTestScore": [fr_list[4], fr_list[5]],
                     "SoftSkillsRating": [fr_list[6], fr_list[7]],
                     "SSC_Marks": [fr_list[8], fr_list[9]],
                     "HSC_Marks": [fr_list[10], fr_list[11]]}
    return render_template(
        'index.html',
        discrete_options=discrete_options,
        filter_ranges=filter_ranges,
        scatter_ranges=scatter_ranges,
        dropdown_options=dropdown_options
    )

# @app.route('/data')
# def data():
#     request_data = request.get_json()

#     # Extract slider values and checkboxes
#     internships_min, internships_max = request_data['filter_ranges']['Internships']
#     projects_min, projects_max = request_data['filter_ranges']['Projects']
#     AptitudeTestScore_min, AptitudeTestScore_max = request_data['filter_ranges']['AptitudeTestScore']
#     SoftSkillsRating_min, SoftSkillsRating_max = request_data['filter_ranges']['SoftSkillsRating']
#     SSC_Marks_min, SSC_Marks_max = request_data['filter_ranges']['SSC_Marks']
#     HSC_Marks_min, HSC_Marks_max = request_data['filter_ranges']['HSC_Marks']
#     # selected_options_EA=request_data['selected_options_EA']
#     # selected_options_PT=request_data['selected_options_PT']

#     continuous_predicate = f'''
#     (Internships BETWEEN {internships_min} AND {internships_max})
#     AND (Projects BETWEEN {projects_min} AND {projects_max})
#     AND (AptitudeTestScore BETWEEN {AptitudeTestScore_min} AND {AptitudeTestScore_max})
#     AND (SoftSkillsRating BETWEEN {SoftSkillsRating_min} AND {SoftSkillsRating_max})
#     AND (SSC_Marks BETWEEN {SSC_Marks_min} AND {SSC_Marks_max})
#     AND (HSC_Marks BETWEEN {HSC_Marks_min} AND {HSC_Marks_max})
#     '''
#     #NEED TO UPDATE TO INCLUDE T/F RADIO BUTTONS
#     predicate = continuous_predicate

#     # if selected_options_PT:
#     #     discrete_predicate = f"PlacementTraining IN ({', '.join([f"'{status}'" for status in selected_options_PT])})"
#     #     predicate = ' AND '.join([continuous_predicate, discrete_predicate])  
#     # else:
#     #     predicate = continuous_predicate + ' AND 0 = 1'
    
#     # if selected_options_EA:
#     #     discrete_predicate = f"PlacementTraining IN ({', '.join([f"'{status}'" for status in selected_options_EA])})"
#     #     predicate = ' AND '.join([continuous_predicate, discrete_predicate])  
#     # else:
#     #     predicate = continuous_predicate + ' AND 0 = 1'

#     # print(selected_options_PT)
#     # print(selected_options_EA)

#     #Scatterplot
#     scatter_query = f'SELECT X, Y FROM placement_data WHERE {predicate}'
#     scatt`er_results = con.sql(scatter_query).df()
#     scatter_data = (scatter_results.to_dict(orient='records'))


#     # Query the pre-loaded table
#     return  scatter_data.json()

@app.route('/update', methods=['POST'])
def update():
    request_data = request.get_json()
    print(request_data)

    filters = request_data['filter_values']

    # Extract slider values and checkboxes
    internships_min, internships_max = filters['Internships']
    projects_min, projects_max = filters['Projects']
    AptitudeTestScore_min, AptitudeTestScore_max = filters['AptitudeTestScore']
    SoftSkillsRating_min, SoftSkillsRating_max = filters['SoftSkillsRating']
    SSC_Marks_min, SSC_Marks_max = filters['SSC_Marks']
    HSC_Marks_min, HSC_Marks_max = filters['HSC_Marks']


    # Get x and y axis
    X = request_data['x_axis']
    Y = request_data['y_axis']


    selected_options_EA=request_data['selected_options_EA']
    selected_options_PT=request_data['selected_options_PT']

    continuous_predicate = f'''
    (Internships BETWEEN {internships_min} AND {internships_max})
    AND (Projects BETWEEN {projects_min} AND {projects_max})
    AND (AptitudeTestScore BETWEEN {AptitudeTestScore_min} AND {AptitudeTestScore_max})
    AND (SoftSkillsRating BETWEEN {SoftSkillsRating_min} AND {SoftSkillsRating_max})
    AND (SSC_Marks BETWEEN {SSC_Marks_min} AND {SSC_Marks_max})
    AND (HSC_Marks BETWEEN {HSC_Marks_min} AND {HSC_Marks_max})
    '''

    # Discrete filters (checkboxes)
    discrete_predicates = []
    if selected_options_EA:
        discrete_predicates.append(f"ExtracurricularActivities IN ({', '.join([f"'{status}'" for status in selected_options_EA])})")
    if selected_options_PT:
        discrete_predicates.append(f"PlacementTraining IN ({', '.join([f"'{status}'" for status in selected_options_PT])})")

    # Combine continuous and discrete filters
    if discrete_predicates:
        predicate = f"{continuous_predicate} AND {' AND '.join(discrete_predicates)}"
    else:
        predicate = f"{continuous_predicate} AND 0 = 1"  # If no checkboxes are selected, return empty results

    print("Final Predicate:", predicate)

    #Scatterplot
    scatter_query = f'SELECT {X}, {Y} FROM placement_data WHERE {predicate}'
    # print(scatter_query)
    scatter_results = con.sql(scatter_query).df()
    scatter_data = (scatter_results.to_dict(orient='records'))

    scatter_ranges_query = f'SELECT MIN({X}), MAX({X}), MIN({Y}), MAX({Y}) FROM placement_data'
    scatter_ranges = con.sql(scatter_ranges_query).df()

    scatter_ranges = scatter_ranges.iloc[0].tolist()





    print("Scatter Ranges:", scatter_ranges)

    # Query the pre-loaded table
    return jsonify({'scatter_data': scatter_data, 'scatter_ranges': scatter_ranges})

if __name__ == '__main__':
    app.run(debug=True)