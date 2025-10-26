from flask import Flask, jsonify
from SPARQLWrapper import SPARQLWrapper, JSON

app = Flask(__name__)

# Change this to your Fuseki SPARQL endpoint
FUSEKI_URL = "http://localhost:3030/dataset/sparql"

@app.route('/classes')
def get_classes():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        SELECT ?class WHERE { ?class a owl:Class . }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    classes = [r['class']['value'] for r in results['results']['bindings']]
    return jsonify(classes)

if __name__ == '__main__':
    app.run(debug=True)
