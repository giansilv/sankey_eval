import csv
from os import listdir

def find_csv_filenames( path_to_dir, suffix=".csv" ):
    filenames = listdir(path_to_dir)
    return [ filename for filename in filenames if filename.endswith(suffix) ]
	
	
filenames = find_csv_filenames("'/path/to/dir'")




for name in filenames:
	array_val = []
	thefile = open(name[:8]+'m.csv', 'w')

	with open(name, 'U') as csvfile:
		spamreader = csv.reader(csvfile)
		map = 0.0
		mrbp = 0.0
		mp10 = 0.0
		mndcg = 0.0
		mtwist = 0.0
		merr = 0.0
		ssapw = 0.0
		allap = []
		ssrbpw = 0.0
		allrbp = []
		ssp10w = 0.0
		allp10 = []
		ssndcgw = 0.0
		allndcg = []
		sstwistw = 0.0
		alltwist = []
		sserrw = 0.0
		allerr = []

		id= 0
		for row in spamreader:

			if not row:
				pass
			elif(id == 0):
				id = 1
				array_val.append(row[1] + "," + row[2]+","+row[3]+ "," + row[4] + "," + row[5] + "," + row[6]+","+row[7] + "," + row[8]+","+row[9]+",ssapw,ssrbpw,ssp10w,ssndcgw,sstwistw,sserrw")
				#print(row[1], row[2], row[3], "map")
			elif(id == 50):
				id=1
				ap = float(row[4])
				rbp = float(row[5])
				p10 = float(row[6])
				ndcg = float(row[7])
				twist = float(row[8])
				err = float(row[9])
				
				map = map + float(ap)
				mrbp = mrbp  + float(rbp)
				mp10 = mp10 + float(p10)
				mndcg = mndcg + float(ndcg)
				mtwist = mtwist + float(twist)
				merr = merr + float(err)
				map = map/50
				mrbp = mrbp/50
				mp10 = mp10/50
				mndcg = mndcg/50
				mtwist = mtwist/50
				merr = merr/50
				
				for x in allap:
					ssapw += (x-map)**2
				for x in allrbp:
					ssrbpw += (x-mrbp)**2
				for x in allp10:
					ssp10w += (x-mp10)**2
				for x in allndcg:
					ssndcgw += (x-mndcg)**2
				for x in alltwist:
					sstwistw += (x-mtwist)**2
				for x in allerr:
					sserrw += (x-merr)**2
					
				
				array_val.append(row[1] + "," + row[2]+","+row[3]+","+str(map)+","+str(mrbp)+","+str(mp10)+","+str(mndcg)+","+str(mtwist)+","+str(merr)+","+str(ssapw)+","+str(ssrbpw)+","+str(ssp10w)+","+str(ssndcgw)+","+str(sstwistw)+","+str(sserrw))
				#print(row[1], row[2], row[3], map)
				
				map = 0.0
				mrbp = 0.0
				mp10 = 0.0
				mndcg = 0.0
				mtwist = 0.0
				merr = 0.0
				ssapw = 0.0
				allap = []
				ssrbpw = 0.0
				allrbp = []
				ssp10w = 0.0
				allp10 = []
				ssndcgw = 0.0
				allndcgp = []
				sstwistw = 0.0
				alltwist = []
				sserrw = 0.0
				allerr = []
				
			else:
				ap = float(row[4])
				rbp = float(row[5])
				p10 = float(row[6])
				ndcg = float(row[7])
				twist = float(row[8])
				err = float(row[9])			
				id=id+1
				
				allap.append(ap)
				allrbp.append(rbp)
				allp10.append(p10)
				allndcg.append(ndcg)
				alltwist.append(twist)
				allerr.append(err)
				
				map = map + float(ap)
				mrbp = mrbp  + float(rbp)
				mp10 = mp10 + float(p10)
				mndcg = mndcg + float(ndcg)
				mtwist = mtwist + float(twist)
				merr = merr + float(err)

	for row in array_val:
		thefile.write("%s\n" % row)


